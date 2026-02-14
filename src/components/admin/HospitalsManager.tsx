'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
    useEffect(() => {
        document.title = '병원 관리 | Open Beauty Admin';
    }, []);

    const [view, setView] = useState<'LIST' | 'REGISTER'>('LIST');
    const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        setView('LIST');
        setFormData({ name: '', category: 'DERMATOLOGY', address: '', description: '', detail_description: '', image_url: '', rank: 1 });
        setFormPricing([]);
        setFormFAQs([]);
        setFormChatbot({ hospital_id: '', system_prompt: '', welcome_message: '', is_active: false });
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
                    <h2 className={styles.cardTitle}>{formData.id ? '🏥 병원 정보 수정' : '🏥 새 병원/클리닉 등록'}</h2>
                    <div>
                        {formData.id && (
                            <button
                                className={styles.actionBtn}
                                style={{ color: 'var(--c-danger)', marginRight: '1rem' }}
                                onClick={() => { handleDelete(formData.id!); setView('LIST'); }}
                            >🗑️ 삭제</button>
                        )}
                        <button className={styles.actionBtn} onClick={resetAndBack}>취소</button>
                    </div>
                </div>

                <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>📝 기본 정보</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>병원명 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="예: 아우름 피부과"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>카테고리 <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>주소</label>
                                <input
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="예: 서울시 강남구 논현동 123-45"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>노출 순위</label>
                                <input
                                    type="number"
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    value={formData.rank || 1}
                                    onChange={e => setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })}
                                    min={1}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>이미지 URL</label>
                            <input
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="https://..."
                                value={formData.image_url || ''}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>간단 소개 (리스트용)</label>
                            <textarea
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="병원의 강점이나 특징을 간결하게 입력하세요"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>상세 소개 (상세 페이지용)</label>
                            <textarea
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '150px' }}
                                placeholder="병원의 상세 소개문을 입력하세요. 줄 바꿈도 반영됩니다."
                                value={formData.detail_description || ''}
                                onChange={e => setFormData({ ...formData, detail_description: e.target.value })}
                            />
                        </div>

                        {/* Chatbot Settings */}
                        <section style={{ padding: '1.5rem', background: '#fcfaf5', borderRadius: '12px', border: '1px solid #e0c8ff' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#7e3af2', fontSize: '1.25rem' }}>🤖 챗봇 설정</h4>
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
                    <div>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>💰 시술 가격표</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className={styles.btnPrimary} style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }} onClick={addPricingRow}>+ 시술 메뉴 추가</button>
                        </div>
                        <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>시술명</th>
                                        <th className={styles.th} style={{ width: '140px' }}>정가 (KRW)</th>
                                        <th className={styles.th} style={{ width: '140px' }}>엔화 (JPY)</th>
                                        <th className={styles.th} style={{ width: '140px', color: '#7e3af2' }}>이벤트 가격</th>
                                        <th className={styles.th} style={{ width: '100px', color: 'red' }}>할인율</th>
                                        <th className={styles.th} style={{ width: '70px' }}>삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formPricing.map((p, idx) => (
                                        <tr key={idx}>
                                            <td className={styles.td}>
                                                <input className={styles.td} style={{ width: '100%', border: '1px solid #eee' }}
                                                    value={p.treatment_name} onChange={e => updatePricingRow(idx, 'treatment_name', e.target.value)}
                                                    placeholder="예: 피코토닝" />
                                            </td>
                                            <td className={styles.td}>
                                                <input type="number" className={styles.td} style={{ width: '100%', border: '1px solid #eee' }}
                                                    value={p.price_krw || ''} onChange={e => updatePricingRow(idx, 'price_krw', parseInt(e.target.value) || null)}
                                                    placeholder="45000" />
                                            </td>
                                            <td className={styles.td}>
                                                <input type="number" className={styles.td} style={{ width: '100%', border: '1px solid #eee' }}
                                                    value={p.price_jpy || ''} onChange={e => updatePricingRow(idx, 'price_jpy', parseInt(e.target.value) || null)}
                                                    placeholder="15000" />
                                            </td>
                                            <td className={styles.td}>
                                                <input type="number" className={styles.td} style={{ width: '100%', border: '1px solid #eee', color: '#7e3af2', fontWeight: 'bold' }}
                                                    value={p.event_price || ''} onChange={e => updatePricingRow(idx, 'event_price', parseInt(e.target.value) || null)}
                                                    placeholder="35000" />
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input type="number" className={styles.td}
                                                        style={{ width: '60px', border: '1px solid #eee', color: 'red', textAlign: 'center' }}
                                                        value={p.discount_percent || ''} readOnly />
                                                    <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>%</span>
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <button className={styles.actionBtn} style={{ color: 'red', fontSize: '1.2rem' }} onClick={() => removePricingRow(idx)}>×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {formPricing.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '1.1rem' }}>등록된 시술이 없습니다.</div>}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>❓ 자주 묻는 질문 (FAQ)</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className={styles.btnPrimary} style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }} onClick={addFaqRow}>+ FAQ 추가</button>
                        </div>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {formFAQs.map((f, idx) => (
                                <div key={idx} style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#444' }}>Q. 질문</label>
                                        <button onClick={() => removeFaqRow(idx)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️ 삭제</button>
                                    </div>
                                    <input className={styles.td} style={{ width: '100%', marginBottom: '1rem', border: '1px solid #eee' }}
                                        value={f.question} onChange={e => updateFaqRow(idx, 'question', e.target.value)}
                                        placeholder="예: 일본어 상담이 가능한가요?" />
                                    <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#444', display: 'block', marginBottom: '0.5rem' }}>A. 답변</label>
                                    <textarea className={styles.td} style={{ width: '100%', border: '1px solid #eee' }}
                                        value={f.answer} onChange={e => updateFaqRow(idx, 'answer', e.target.value)}
                                        rows={3} placeholder="예: 네, 일본어 통역 직원이 상주하고 있습니다." />
                                </div>
                            ))}
                            {formFAQs.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '1.1rem', background: '#f9fafb', borderRadius: '12px' }}>등록된 FAQ가 없습니다.</div>}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #eee' }}>
                    <button className={styles.actionBtn} style={{ padding: '0.8rem 2rem', fontSize: '1.2rem' }} onClick={resetAndBack}>취소</button>
                    <button
                        className={styles.btnPrimary}
                        style={{ padding: '0.8rem 3rem', fontSize: '1.2rem', background: '#2e7d32', opacity: saving ? 0.6 : 1 }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : formData.id ? '변경사항 저장' : '병원 등록하기'}
                    </button>
                </div>
            </div>
        );
    }

    // ===================== LIST VIEW =====================
    return (
        <div>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111', margin: 0 }}>총 {hospitals.length}개 병원</h2>
                <button
                    className={styles.btnPrimary}
                    style={{ background: '#2e7d32', padding: '1rem 2.5rem', fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)', borderRadius: '12px' }}
                    onClick={() => setView('REGISTER')}
                >
                    + 새 병원/클리닉 등록
                </button>
            </div>

            <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
                {/* Search & Filter */}
                <div className={styles.tableControls} style={{ background: '#f9fafb', padding: '2rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem' }}>🔍</span>
                        <input
                            className={styles.td}
                            style={{ padding: '1rem 1rem 1rem 3.5rem', width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px', background: '#fff', fontSize: '1.2rem' }}
                            placeholder="병원명, 소개, 주소 등으로 검색..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.td}
                        style={{ padding: '1rem 1.5rem', border: '2px solid #e5e7eb', borderRadius: '12px', minWidth: '240px', background: '#fff', fontSize: '1.2rem' }}
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        <option value="ALL">전체 카테고리</option>
                        {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#999', fontSize: '1.2rem' }}>
                        데이터 불러오는 중...
                    </div>
                ) : (
                    <>
                        <table className={styles.table} style={{ minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th className={styles.th} style={{ width: '70px', textAlign: 'center' }}>순위</th>
                                    <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>이미지</th>
                                    <th className={styles.th} style={{ minWidth: '400px' }}>병원/클리닉 정보</th>
                                    <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>가격표</th>
                                    <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>FAQ</th>
                                    <th className={styles.th} style={{ width: '120px', textAlign: 'right' }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHospitals.map((hospital) => (
                                    <tr key={hospital.id} style={{ transition: 'background 0.2s' }}>
                                        <td className={styles.td} style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem', color: '#7e3af2' }}>#{hospital.rank}</td>
                                        <td className={styles.td} style={{ textAlign: 'center' }}>
                                            <Image
                                                src={hospital.image_url || 'https://via.placeholder.com/60'}
                                                alt={hospital.name}
                                                width={50} height={50}
                                                style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                                                unoptimized
                                            />
                                        </td>
                                        <td className={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', overflow: 'hidden' }}>
                                                <span className={styles.badge} style={{ background: getCategoryColor(hospital.category), color: getCategoryTextColor(hospital.category), fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                    {getCategoryLabel(hospital.category)}
                                                </span>
                                                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hospital.name}</div>
                                            </div>
                                            <div style={{ fontSize: '1.05rem', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hospital.description}</div>
                                            {hospital.address && (
                                                <div style={{ fontSize: '0.95rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    📍 {hospital.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'center', fontWeight: '600', color: '#4b5563' }}>-</td>
                                        <td className={styles.td} style={{ textAlign: 'center', fontWeight: '600', color: '#4b5563' }}>-</td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <button
                                                className={styles.btnPrimary}
                                                style={{ fontSize: '1.2rem', padding: '0.8rem 1.8rem', borderRadius: '8px' }}
                                                onClick={async () => {
                                                    setFormData(hospital);
                                                    await loadHospitalDetail(hospital.id);
                                                    setView('REGISTER');
                                                }}
                                            >수정</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredHospitals.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '5rem', color: '#999', fontSize: '1.2rem', background: '#fff' }}>
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
