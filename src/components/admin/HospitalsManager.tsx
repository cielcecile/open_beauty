'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CLINIC_CATEGORIES } from '@/data/clinics';
import { supabase } from '@/lib/supabase';
import styles from '@/app/admin/admin.module.css';

// --- Types matching Supabase tables ---
interface HospitalRow {
    id: string;
    name: string;
    category: string;
    description: string | null;
    detail_description: string | null;
    image_url: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    rank: number;
    created_at: string;
}

interface PricingRow {
    id?: string;
    hospital_id: string;
    treatment_name: string;
    price_krw: number | null;
    price_jpy: number | null;
    event_price: number | null;
    discount_percent: number;
    is_active: boolean;
    sort_order: number;
}

interface FAQRow {
    id?: string;
    hospital_id: string;
    question: string;
    answer: string;
    sort_order: number;
}

interface ChatbotConfigRow {
    id?: string;
    hospital_id: string;
    system_prompt: string | null;
    welcome_message: string | null;
    is_active: boolean;
}

// --- Category config (Korean for admin) ---
const CATEGORY_OPTIONS = [
    { id: 'DERMATOLOGY', label: '피부과' },
    { id: 'PLASTIC', label: '성형외과' },
    { id: 'DENTISTRY', label: '치과' },
    { id: 'ORIENTAL', label: '한의원' },
];

export default function HospitalsManager() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        document.title = '病院管理 | Open Beauty Admin';
    }, []);

    const [view, setView] = useState<'LIST' | 'REGISTER'>('LIST');
    const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Filtered logic for URL synchronization
    useEffect(() => {
        const mode = searchParams.get('mode');
        const id = searchParams.get('id');

        if (mode === 'register' || mode === 'edit') {
            setView('REGISTER');
        } else {
            setView('LIST');
            setFormData({ name: '', category: 'DERMATOLOGY', address: '', description: '', detail_description: '', image_url: '', rank: 1 });
            setFormPricing([]);
            setFormFAQs([]);
            setFormChatbot({ hospital_id: '', system_prompt: '', welcome_message: '', is_active: false });
        }
    }, [searchParams]);

    // Handle hospital data sync when view changes to REGISTER with an ID
    useEffect(() => {
        const mode = searchParams.get('mode');
        const id = searchParams.get('id');
        if (mode === 'edit' && id && hospitals.length > 0) {
            const hospital = hospitals.find(h => h.id === id);
            if (hospital) {
                setFormData(hospital);
                loadHospitalDetail(id);
            }
        }
    }, [searchParams, hospitals]);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    // Form State
    const [formData, setFormData] = useState<Partial<HospitalRow>>({
        name: '', category: 'DERMATOLOGY', address: '', description: '',
        detail_description: '', image_url: '', rank: 1,
    });
    const [formPricing, setFormPricing] = useState<PricingRow[]>([]);
    const [formFAQs, setFormFAQs] = useState<FAQRow[]>([]);
    const [formChatbot, setFormChatbot] = useState<ChatbotConfigRow>({
        hospital_id: '', system_prompt: '', welcome_message: '', is_active: false,
    });

    // --- Load hospitals from Supabase ---
    const loadHospitals = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .order('category')
                .order('rank');

            if (error) throw error;
            setHospitals(data || []);
        } catch (err) {
            console.error('병원 목록 로드 실패:', err);
            alert('❌ 병원 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadHospitals(); }, [loadHospitals]);

    // Filtered Hospitals
    const filteredHospitals = useMemo(() => {
        return hospitals.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (h.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (h.address || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'ALL' || h.category === filterCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.rank - b.rank);
    }, [hospitals, searchQuery, filterCategory]);

    // --- Load detail data when editing ---
    const loadHospitalDetail = async (hospitalId: string) => {
        try {
            // Load pricing
            const { data: pricingData } = await supabase
                .from('pricing')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('sort_order');
            setFormPricing(pricingData || []);

            // Load FAQs
            const { data: faqData } = await supabase
                .from('faqs')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('sort_order');
            setFormFAQs(faqData || []);

            // Load chatbot config
            const { data: chatbotData } = await supabase
                .from('chatbot_configs')
                .select('*')
                .eq('hospital_id', hospitalId)
                .single();
            setFormChatbot(chatbotData || { hospital_id: hospitalId, system_prompt: '', welcome_message: '', is_active: false });
        } catch (err) {
            console.error('상세 데이터 로드 실패:', err);
        }
    };

    // --- SAVE ---
    const handleSave = async () => {
        if (!formData.name || !formData.category) {
            alert('❌ 병원명과 카테고리는 필수 입력입니다.');
            return;
        }

        setSaving(true);
        try {
            const hospitalPayload = {
                name: formData.name,
                category: formData.category,
                description: formData.description || null,
                detail_description: formData.detail_description || null,
                image_url: formData.image_url || null,
                address: formData.address || null,
                rank: Number(formData.rank) || 1,
            };

            let hospitalId = formData.id;

            if (formData.id) {
                // UPDATE
                const { error } = await supabase
                    .from('hospitals')
                    .update(hospitalPayload)
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                // INSERT
                const newId = Date.now().toString();
                const { error } = await supabase
                    .from('hospitals')
                    .insert({ ...hospitalPayload, id: newId });
                if (error) throw error;
                hospitalId = newId;
            }

            // Save pricing — delete old, insert new
            await supabase.from('pricing').delete().eq('hospital_id', hospitalId!);
            if (formPricing.length > 0) {
                const pricingPayload = formPricing.map((p, i) => ({
                    hospital_id: hospitalId!,
                    treatment_name: p.treatment_name,
                    price_krw: p.price_krw || 0,
                    price_jpy: p.price_jpy || 0,
                    event_price: p.event_price || null,
                    discount_percent: p.discount_percent || 0,
                    is_active: true,
                    sort_order: i,
                }));
                const { error: pErr } = await supabase.from('pricing').insert(pricingPayload);
                if (pErr) throw pErr;
            }

            // Save FAQs
            await supabase.from('faqs').delete().eq('hospital_id', hospitalId!);
            if (formFAQs.length > 0) {
                const faqPayload = formFAQs.map((f, i) => ({
                    hospital_id: hospitalId!,
                    question: f.question,
                    answer: f.answer,
                    sort_order: i,
                }));
                const { error: fErr } = await supabase.from('faqs').insert(faqPayload);
                if (fErr) throw fErr;
            }

            // Save chatbot config — upsert
            if (formChatbot.is_active && formChatbot.system_prompt) {
                await supabase.from('chatbot_configs').delete().eq('hospital_id', hospitalId!);
                const { error: cErr } = await supabase.from('chatbot_configs').insert({
                    hospital_id: hospitalId!,
                    system_prompt: formChatbot.system_prompt,
                    welcome_message: formChatbot.welcome_message || '무엇이든 물어보세요!',
                    is_active: formChatbot.is_active,
                });
                if (cErr) throw cErr;
            }

            alert('✅ 저장이 완료되었습니다.');
            resetAndBack();
            loadHospitals();
        } catch (err) {
            console.error('저장 실패:', err);
            alert(`❌ 저장 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSaving(false);
        }
    };

    // --- DELETE ---
    const handleDelete = async (id: string) => {
        if (!confirm('이 병원 정보를 완전히 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase.from('hospitals').delete().eq('id', id);
            if (error) throw error;
            alert('🗑️ 삭제되었습니다.');
            loadHospitals();
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('❌ 삭제 중 오류가 발생했습니다.');
        }
    };

    const resetAndBack = () => {
        router.push('/admin/hospitals');
    };

    // --- Pricing row helpers ---
    const addPricingRow = () => {
        setFormPricing(prev => [...prev, {
            hospital_id: formData.id || '',
            treatment_name: '', price_krw: null, price_jpy: null,
            event_price: null, discount_percent: 0, is_active: true, sort_order: prev.length,
        }]);
    };
    const updatePricingRow = (index: number, field: keyof PricingRow, value: string | number | null) => {
        setFormPricing(prev => prev.map((p, i) => {
            if (i !== index) return p;
            const updated = { ...p, [field]: value };
            // Auto-calc discount
            if ((field === 'price_krw' || field === 'event_price') && updated.price_krw && updated.event_price) {
                const orig = Number(updated.price_krw);
                const evt = Number(updated.event_price);
                if (orig > 0 && evt > 0 && evt < orig) {
                    updated.discount_percent = Math.round(((orig - evt) / orig) * 100);
                }
            }
            return updated;
        }));
    };
    const removePricingRow = (index: number) => {
        setFormPricing(prev => prev.filter((_, i) => i !== index));
    };

    // --- FAQ row helpers ---
    const addFaqRow = () => {
        setFormFAQs(prev => [...prev, { hospital_id: formData.id || '', question: '', answer: '', sort_order: prev.length }]);
    };
    const updateFaqRow = (index: number, field: 'question' | 'answer', value: string) => {
        setFormFAQs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
    };
    const removeFaqRow = (index: number) => {
        setFormFAQs(prev => prev.filter((_, i) => i !== index));
    };

    // --- Colors ---
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = { 'DERMATOLOGY': '#e3f2fd', 'PLASTIC': '#fce4ec', 'DENTISTRY': '#e8f5e9', 'ORIENTAL': '#fff3e0' };
        return colors[category] || '#f0f0f0';
    };
    const getCategoryTextColor = (category: string) => {
        const colors: Record<string, string> = { 'DERMATOLOGY': '#1565c0', 'PLASTIC': '#c2185b', 'DENTISTRY': '#2e7d32', 'ORIENTAL': '#ef6c00' };
        return colors[category] || '#666';
    };
    const getCategoryLabel = (category: string) => {
        return CATEGORY_OPTIONS.find(c => c.id === category)?.label ||
            CLINIC_CATEGORIES.find(c => c.id === category)?.label || category;
    };

    // ===================== REGISTER / EDIT VIEW =====================
    if (view === 'REGISTER') {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.pageTitle}>{formData.id ? '🏥 病院情報修正' : '🏥 新規病院/クリニック登録'}</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {formData.id && (
                            <button
                                className={styles.btnDanger}
                                onClick={() => { handleDelete(formData.id!); }}
                            >🗑️ 削除</button>
                        )}
                        <button className={styles.btnSecondary} onClick={resetAndBack}>キャンセル</button>
                    </div>
                </div>

                <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gap: '2.5rem' }}>
                        <h3 className={styles.cardTitle}>📝 基本情報</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>病院名 <span style={{ color: 'var(--admin-danger)' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="例: アウルム皮膚科"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>カテゴリー <span style={{ color: 'var(--admin-danger)' }}>*</span></label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>住所</label>
                                <input
                                    type="text"
                                    placeholder="例: ソウル市江南区論峴洞 123-45"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>露出順位</label>
                                <input
                                    type="number"
                                    value={formData.rank || 1}
                                    onChange={e => setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })}
                                    min={1}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>画像 URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={formData.image_url || ''}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>簡単紹介 (リスト用)</label>
                                <input
                                    type="text"
                                    placeholder="病院の強みや特徴를 간결하게 입력하세요"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>詳細紹介 (詳細ページ用)</label>
                        <textarea
                            style={{ minHeight: '180px' }}
                            placeholder="病院の詳細紹介文を入力してください。改行も反映されます。"
                            value={formData.detail_description || ''}
                            onChange={e => setFormData({ ...formData, detail_description: e.target.value })}
                        />
                    </div>

                    {/* Chatbot Settings */}
                    <section className={styles.card} style={{ border: '1px solid var(--admin-primary-light)', background: 'rgba(99, 102, 241, 0.03)', boxShadow: 'none' }}>
                        <h4 className={styles.cardTitle} style={{ color: 'var(--admin-primary)', fontSize: '1.15rem' }}>🤖 チャットボット設定</h4>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formChatbot.is_active}
                                    onChange={(e) => setFormChatbot({ ...formChatbot, is_active: e.target.checked })}
                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                AI 챗봇 활성화
                            </label>
                        </div>

                        {formChatbot.is_active && (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '1.1rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>AI 페르소나/프롬프트 설정</label>
                                    <textarea
                                        className={styles.td}
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}
                                        placeholder="챗봇의 성격, 응답 지침, 병원 정보 등을 입력하세요"
                                        value={formChatbot.system_prompt || ''}
                                        onChange={e => setFormChatbot({ ...formChatbot, system_prompt: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '1.1rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>환영 메시지</label>
                                    <input
                                        className={styles.td}
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}
                                        placeholder="예: 안녕하세요! 무엇이든 물어보세요 😊"
                                        value={formChatbot.welcome_message || ''}
                                        onChange={e => setFormChatbot({ ...formChatbot, welcome_message: e.target.value })}
                                    />
                                </div>
                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>
                                        💡 <strong>자동 학습:</strong> 등록된 「시술 가격표」와 「FAQ」는 챗봇이 자동으로 참조합니다.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Pricing Section */}
                <div style={{ marginTop: '3.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>💰 施術価格表</h3>
                        <button className={styles.btnPrimary} onClick={addPricingRow}>+ 施術メニュー追加</button>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>施術名</th>
                                    <th className={styles.th} style={{ width: '140px' }}>定価 (KRW)</th>
                                    <th className={styles.th} style={{ width: '140px' }}>円 (JPY)</th>
                                    <th className={styles.th} style={{ width: '140px', color: 'var(--admin-primary)' }}>イベント価格</th>
                                    <th className={styles.th} style={{ width: '100px', color: 'var(--admin-danger)' }}>割引率</th>
                                    <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>削除</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formPricing.map((p, idx) => (
                                    <tr key={idx}>
                                        <td className={styles.td}>
                                            <input type="text" placeholder="例: ピコトーニング" value={p.treatment_name} onChange={e => updatePricingRow(idx, 'treatment_name', e.target.value)} />
                                        </td>
                                        <td className={styles.td}>
                                            <input type="number" placeholder="45000" value={p.price_krw || ''} onChange={e => updatePricingRow(idx, 'price_krw', parseInt(e.target.value) || null)} />
                                        </td>
                                        <td className={styles.td}>
                                            <input type="number" placeholder="5000" value={p.price_jpy || ''} onChange={e => updatePricingRow(idx, 'price_jpy', parseInt(e.target.value) || null)} />
                                        </td>
                                        <td className={styles.td}>
                                            <input type="number" placeholder="35000" value={p.event_price || ''} onChange={e => updatePricingRow(idx, 'event_price', parseInt(e.target.value) || null)} style={{ color: 'var(--admin-primary)', fontWeight: 'bold' }} />
                                        </td>
                                        <td className={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--admin-danger)', fontWeight: 'bold' }}>
                                                {p.discount_percent}%
                                            </div>
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'center' }}>
                                            <button className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => removePricingRow(idx)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ marginTop: '3.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>❓ よくある質問 (FAQ)</h3>
                        <button className={styles.btnPrimary} onClick={addFaqRow}>+ FAQ追加</button>
                    </div>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {formFAQs.map((f, idx) => (
                            <div key={idx} className={styles.card} style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', boxShadow: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', textTransform: 'uppercase' }}>Q. 質問</label>
                                    <button onClick={() => removeFaqRow(idx)} style={{ color: 'var(--admin-danger)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ 削除</button>
                                </div>
                                <input type="text" placeholder="例: 日本語の相談は可能ですか？" value={f.question} onChange={e => updateFaqRow(idx, 'question', e.target.value)} style={{ marginBottom: '1.5rem' }} />
                                <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>A. 回答</label>
                                <textarea rows={3} placeholder="例: はい、日本語通訳スタッフが常駐しております。" value={f.answer} onChange={e => updateFaqRow(idx, 'answer', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--admin-border)' }}>
                    <button className={styles.btnSecondary} onClick={resetAndBack}>キャンセル</button>
                    <button
                        className={styles.btnSuccess}
                        style={{ padding: '12px 48px', opacity: saving ? 0.6 : 1 }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : formData.id ? '変更事項保存' : '病院登録する'}
                    </button>
                </div>
            </div>
        );
    }

    // ===================== LIST VIEW =====================
    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>総 {hospitals.length}個 病院</h2>
                <button
                    className={styles.btnSuccess}
                    onClick={() => router.push('/admin/hospitals?mode=register')}
                >
                    + 新規病院/クリニック登録
                </button>
            </div>

            <div className={styles.tableContainer}>
                {/* Search & Filter */}
                <div className={styles.tableControls}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--admin-text-muted)', pointerEvents: 'none' }}>🔍</span>
                        <input
                            type="text"
                            style={{ paddingLeft: '48px', height: '48px' }}
                            placeholder="病院名、紹介、住所で検索..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        style={{ width: 'auto', minWidth: '220px', height: '48px' }}
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        <option value="ALL">全カテゴリー</option>
                        {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '8rem', color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>
                        データを読み込んでいます...
                    </div>
                ) : (
                    <>
                        <table className={styles.table} style={{ minWidth: '1000px' }}>
                            <thead>
                                <tr>
                                    <th className={styles.th} style={{ width: '80px', textAlign: 'center' }}>順位</th>
                                    <th className={styles.th} style={{ width: '120px', textAlign: 'center' }}>イメージ</th>
                                    <th className={styles.th} style={{ minWidth: '400px' }}>病院/クリニック情報</th>
                                    <th className={styles.th} style={{ width: '120px', textAlign: 'center' }}>価格表</th>
                                    <th className={styles.th} style={{ width: '120px', textAlign: 'center' }}>FAQ</th>
                                    <th className={styles.th} style={{ width: '150px', textAlign: 'right' }}>管理</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHospitals.map((hospital) => (
                                    <tr key={hospital.id}>
                                        <td className={styles.td} style={{ fontWeight: '800', textAlign: 'center', fontSize: '1.25rem', color: 'var(--admin-primary)' }}>#{hospital.rank}</td>
                                        <td className={styles.td} style={{ textAlign: 'center' }}>
                                            <div style={{ padding: '4px', background: '#fff', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'inline-block' }}>
                                                <Image
                                                    src={hospital.image_url || 'https://via.placeholder.com/60'}
                                                    alt={hospital.name}
                                                    width={64} height={64}
                                                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                    unoptimized
                                                />
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span className={styles.badge} style={{ background: getCategoryColor(hospital.category), color: getCategoryTextColor(hospital.category), border: 'none', padding: '4px 10px', borderRadius: '6px' }}>
                                                    {getCategoryLabel(hospital.category)}
                                                </span>
                                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--admin-text-main)', letterSpacing: '-0.02em' }}>{hospital.name}</div>
                                            </div>
                                            <div style={{ fontSize: '1rem', color: 'var(--admin-text-second)', marginBottom: '8px', lineHeight: '1.5' }}>{hospital.description}</div>
                                            {hospital.address && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    📍 {hospital.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-muted)' }}>-</td>
                                        <td className={styles.td} style={{ textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-muted)' }}>-</td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <button
                                                className={styles.actionBtn}
                                                style={{ padding: '10px 20px', fontWeight: '700' }}
                                                onClick={() => {
                                                    router.push(`/admin/hospitals?mode=edit&id=${hospital.id}`);
                                                }}
                                            >修正</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredHospitals.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>
                                検索結果がありません。
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
