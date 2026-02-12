'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CLINIC_CATEGORIES, INITIAL_CLINICS, Clinic } from '@/data/clinics';
import styles from '@/app/admin/admin.module.css';

export default function HospitalsManager() {
    // SEO: Set page title dynamically
    useEffect(() => {
        document.title = '病院管理 | Open Beauty Admin';
    }, []);

    const [view, setView] = useState<'LIST' | 'REGISTER'>('LIST');
    const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    // Form State
    const [formData, setFormData] = useState<Partial<Clinic>>({
        name: '',
        category: 'DERMATOLOGY',
        address: '',
        description: '',
        detailDescription: '',
        image: 'https://images.unsplash.com/photo-1549488352-7f991f866418?w=600&h=400&fit=crop',
        rank: 1,
        chatbotStatus: 'INACTIVE',
        chatbotPrompt: '',
        pricing: [],
        faqs: [],
        chatbotTrainingFiles: []
    });

    // Filtered Clinics
    const filteredClinics = useMemo(() => {
        return clinics.filter(clinic => {
            const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clinic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (clinic.address || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'ALL' || clinic.category === filterCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.rank - b.rank);
    }, [clinics, searchQuery, filterCategory]);

    // Better Save with Error Handling
    const handleSave = async () => {
        try {
            if (!formData.name || !formData.category) {
                throw new Error('病院名とカテゴリは必須入力項目です。');
            }

            const clinicToSave: Clinic = {
                id: formData.id || Date.now().toString(),
                name: formData.name,
                category: formData.category as Clinic['category'],
                address: formData.address || '',
                description: formData.description || '',
                detailDescription: formData.detailDescription || '',
                image: formData.image || 'https://images.unsplash.com/photo-1549488352-7f991f866418?w=600&h=400&fit=crop',
                rank: Number(formData.rank) || clinics.length + 1,
                chatbotStatus: formData.chatbotStatus || 'INACTIVE',
                chatbotPrompt: formData.chatbotPrompt || '',
                pricing: formData.pricing || [],
                faqs: formData.faqs || [],
                chatbotTrainingFiles: formData.chatbotTrainingFiles || []
            };

            if (formData.id) {
                setClinics(prev => prev.map(c => c.id === formData.id ? clinicToSave : c));
            } else {
                setClinics(prev => [...prev, clinicToSave]);
            }

            alert('✅ 保存が完了しました。');
            resetAndBack();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('Save failed:', err);
            alert(`❌ 保存中にエラーが発生しました: ${message}`);
        }
    };

    const resetAndBack = () => {
        setView('LIST');
        setFormData({
            name: '',
            category: 'DERMATOLOGY',
            address: '',
            description: '',
            detailDescription: '',
            rank: clinics.length + 1,
            image: '',
            chatbotStatus: 'INACTIVE',
            chatbotPrompt: '',
            pricing: [],
            faqs: [],
            chatbotTrainingFiles: []
        });
    };

    const handleDelete = (id: string) => {
        try {
            if (confirm('この病院情報を完全に削除してもよろしいですか？')) {
                setClinics(prev => prev.filter(c => c.id !== id));
                alert('病院情報を削除しました。');
            }
        } catch (err) {
            console.error('Delete failed:', err);
            alert('削除中にエラーが発生しました。');
        }
    };

    // Pricing Row Handlers
    const addPricingRow = () => {
        const newPricing = [...(formData.pricing || []), { id: Date.now().toString(), title: '', price: '', eventPrice: '', discountPercent: 0 }];
        setFormData({ ...formData, pricing: newPricing });
    };

    const updatePricingRow = (id: string, field: 'title' | 'price' | 'eventPrice' | 'discountPercent', value: string | number) => {
        const currentPricing = (formData.pricing || []) as NonNullable<Clinic['pricing']>;
        const newPricing = currentPricing.map(p => {
            if (p.id !== id) return p;

            const updatedItem = { ...p, [field]: value } as typeof p;

            if (field === 'price' || field === 'eventPrice') {
                const originalPriceStr = field === 'price' ? String(value) : (p.price || '');
                const eventPriceStr = field === 'eventPrice' ? String(value) : (p.eventPrice || '');

                const originalPrice = parseFloat(originalPriceStr.replace(/[^0-9.]/g, '')) || 0;
                const eventPrice = parseFloat(eventPriceStr.replace(/[^0-9.]/g, '')) || 0;

                if (originalPrice > 0 && eventPrice > 0 && eventPrice < originalPrice) {
                    updatedItem.discountPercent = Math.round(((originalPrice - eventPrice) / originalPrice) * 100);
                } else if (!eventPriceStr) {
                    updatedItem.discountPercent = 0;
                }
            }

            return updatedItem;
        });
        setFormData({ ...formData, pricing: newPricing });
    };

    const removePricingRow = (id: string) => {
        setFormData({ ...formData, pricing: (formData.pricing || []).filter(p => p.id !== id) });
    };

    // FAQ Row Handlers
    const addFaqRow = () => {
        const newFaqs = [...(formData.faqs || []), { id: Date.now().toString(), question: '', answer: '' }];
        setFormData({ ...formData, faqs: newFaqs });
    };

    const updateFaqRow = (id: string, field: 'question' | 'answer', value: string) => {
        const newFaqs = (formData.faqs || []).map(f => f.id === id ? { ...f, [field]: value } : f);
        setFormData({ ...formData, faqs: newFaqs });
    };

    const removeFaqRow = (id: string) => {
        setFormData({ ...formData, faqs: (formData.faqs || []).filter(f => f.id !== id) });
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'DERMATOLOGY': '#e3f2fd',
            'PLASTIC': '#fce4ec',
            'DENTISTRY': '#e8f5e9',
            'ORIENTAL': '#fff3e0'
        };
        return colors[category] || '#f0f0f0';
    };

    const getCategoryTextColor = (category: string) => {
        const colors: Record<string, string> = {
            'DERMATOLOGY': '#1565c0',
            'PLASTIC': '#c2185b',
            'DENTISTRY': '#2e7d32',
            'ORIENTAL': '#ef6c00'
        };
        return colors[category] || '#666';
    };

    if (view === 'REGISTER') {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.cardTitle}>{formData.id ? '🏥 病院情報の編集' : '🏥 新規病院・クリニック登録'}</h2>
                    <div>
                        {formData.id && (
                            <button
                                className={styles.actionBtn}
                                style={{ color: 'var(--c-danger)', marginRight: '1rem' }}
                                onClick={() => {
                                    handleDelete(formData.id!);
                                    setView('LIST');
                                }}
                            >🗑️ 削除</button>
                        )}
                        <button className={styles.actionBtn} onClick={resetAndBack}>キャンセル</button>
                    </div>
                </div>

                <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Basic Info Section */}
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>📝 基本情報</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>病院名 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="例: アウルム皮膚科"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>カテゴリ <span style={{ color: 'red' }}>*</span></label>
                                    <select
                                    className={styles.td}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as Clinic['category'] })}
                                >
                                    {CLINIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>所在地 (GEO/住所)</label>
                            <input
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="例: ソウル特別市江南区..."
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>病院簡易紹介 (リスト表示用)</label>
                            <textarea
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                placeholder="病院の強みや特徴を簡潔に入력してください"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '1.15rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>病院詳細紹介 (詳細ページ用)</label>
                            <textarea
                                className={styles.td}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '150px' }}
                                placeholder="病院の詳細な紹介文を入力してください。改行も反映されます。"
                                value={formData.detailDescription || ''}
                                onChange={e => setFormData({ ...formData, detailDescription: e.target.value })}
                            />
                        </div>

                        {/* Chatbot Settings */}
                        <section style={{ padding: '1.5rem', background: '#fcfaf5', borderRadius: '12px', border: '1px solid #e0c8ff' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#7e3af2', fontSize: '1.25rem' }}>🤖 チャットボット設定</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.chatbotStatus === 'ACTIVE'}
                                        onChange={(e) => setFormData({ ...formData, chatbotStatus: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                                        style={{ width: '1.2rem', height: '1.2rem' }}
                                    />
                                    AIチャットボットを有効にする
                                </label>
                            </div>

                            {formData.chatbotStatus === 'ACTIVE' && (
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '1.1rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>AIペルソナ・プロンプト設定</label>
                                        <textarea
                                            className={styles.td}
                                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}
                                            placeholder="チャットボットの性格や応答指針を入力してください"
                                            value={formData.chatbotPrompt}
                                            onChange={e => setFormData({ ...formData, chatbotPrompt: e.target.value })}
                                            rows={4}
                                        />
                                    </div>

                                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '1.05rem', color: '#333' }}>📚 AI学習データソース</h5>
                                        <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '1.0rem', color: '#666', lineHeight: '1.6' }}>
                                            <li><strong>基本データ:</strong> 登録された「施術価格リスト」と「FAQ」は自動学習されます.</li>
                                            <li><strong>追加資料:</strong> マニュアルや病院資料をアップロードして学習を強化できます.</li>
                                        </ul>

                                        <div style={{ marginTop: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: 'bold' }}>追加学習ファイル (PDF, TXT, DOCX)</label>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.txt,.docx,.doc"
                                                className={styles.td}
                                                style={{ width: '100%', background: '#f9fafb' }}
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    const fileNames = files.map(f => f.name);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        chatbotTrainingFiles: [...(prev.chatbotTrainingFiles || []), ...fileNames]
                                                    }));
                                                }}
                                            />
                                            {formData.chatbotTrainingFiles && formData.chatbotTrainingFiles.length > 0 && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                                    <p style={{ fontSize: '1.0rem', fontWeight: '600', marginBottom: '0.5rem' }}>アップロード済み:</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {formData.chatbotTrainingFiles.map((file, idx) => (
                                                            <div key={idx} style={{ background: 'white', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', border: '1px solid #ddd' }}>
                                                                <span>{file}</span>
                                                                <button
                                                                    onClick={() => setFormData(prev => ({
                                                                        ...prev,
                                                                        chatbotTrainingFiles: prev.chatbotTrainingFiles?.filter((_, i) => i !== idx)
                                                                    }))}
                                                                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                                                >×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Pricing Section */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>💰 施術価格リスト</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className={styles.btnPrimary} style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }} onClick={addPricingRow}>+ 施術メニュー追加</button>
                        </div>
                        <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>施術名</th>
                                        <th className={styles.th} style={{ width: '160px' }}>定価 (KRW)</th>
                                        <th className={styles.th} style={{ width: '160px', color: '#7e3af2' }}>イベント価格</th>
                                        <th className={styles.th} style={{ width: '100px', color: 'red' }}>割引率</th>
                                        <th className={styles.th} style={{ width: '80px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(formData.pricing || []).map(p => (
                                        <tr key={p.id}>
                                            <td className={styles.td}>
                                                <input className={styles.td} style={{ width: '100%', border: '1px solid #eee' }} value={p.title} onChange={e => updatePricingRow(p.id, 'title', e.target.value)} placeholder="例: オリジオ 300shot" />
                                            </td>
                                            <td className={styles.td}>
                                                <input className={styles.td} style={{ width: '100%', border: '1px solid #eee' }} value={p.price} onChange={e => updatePricingRow(p.id, 'price', e.target.value)} placeholder="350,000" />
                                            </td>
                                            <td className={styles.td}>
                                                <input className={styles.td} style={{ width: '100%', border: '1px solid #eee', color: '#7e3af2', fontWeight: 'bold' }} value={p.eventPrice || ''} onChange={e => updatePricingRow(p.id, 'eventPrice', e.target.value)} placeholder="290,000" />
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        className={styles.td}
                                                        style={{ width: '60px', border: '1px solid #eee', color: 'red', textAlign: 'center' }}
                                                        value={p.discountPercent || ''}
                                                        onChange={e => updatePricingRow(p.id, 'discountPercent', parseInt(e.target.value) || 0)}
                                                    />
                                                    <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>%</span>
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <button className={styles.actionBtn} style={{ color: 'red', fontSize: '1.2rem' }} onClick={() => removePricingRow(p.id)}>×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(formData.pricing || []).length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '1.1rem' }}>登録された施術メニューがありません。</div>}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid #7e3af2', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#333' }}>❓ よくある質問 (FAQ)</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className={styles.btnPrimary} style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }} onClick={addFaqRow}>+ FAQ追加</button>
                        </div>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {(formData.faqs || []).map(f => (
                                <div key={f.id} style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#444' }}>Q. 質問</label>
                                        <button onClick={() => removeFaqRow(f.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️ 削除</button>
                                    </div>
                                    <input className={styles.td} style={{ width: '100%', marginBottom: '1rem', border: '1px solid #eee' }} value={f.question} onChange={e => updateFaqRow(f.id, 'question', e.target.value)} placeholder="例: 日本語の対応は可能ですか？" />
                                    <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#444', display: 'block', marginBottom: '0.5rem' }}>A. 回答</label>
                                    <textarea className={styles.td} style={{ width: '100%', border: '1px solid #eee' }} value={f.answer} onChange={e => updateFaqRow(f.id, 'answer', e.target.value)} rows={3} placeholder="例: はい、日本人スタッフが常駐しております。" />
                                </div>
                            ))}
                            {(formData.faqs || []).length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '1.1rem', background: '#f9fafb', borderRadius: '12px' }}>登録されたFAQがありません.</div>}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #eee' }}>
                    <button className={styles.actionBtn} style={{ padding: '0.8rem 2rem', fontSize: '1.2rem' }} onClick={resetAndBack}>キャンセル</button>
                    <button className={styles.btnPrimary} style={{ padding: '0.8rem 3rem', fontSize: '1.2rem', background: '#2e7d32' }} onClick={handleSave}>{formData.id ? '変更を保存' : '病院を登録する'}</button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    className={styles.btnPrimary}
                    style={{ background: '#2e7d32', padding: '1rem 2.5rem', fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)', borderRadius: '12px' }}
                    onClick={() => setView('REGISTER')}
                >
                    + 新規病院・クリニック登録
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
                            placeholder="病院名、紹介文、住所などで検索..."
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
                        <option value="ALL">すべてのカテゴリ</option>
                        {CLINIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <table className={styles.table} style={{ minWidth: '900px' }}>
                    <thead>
                        <tr>
                            <th className={styles.th} style={{ width: '70px', textAlign: 'center' }}>順位</th>
                            <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>画像</th>
                            <th className={styles.th} style={{ minWidth: '400px' }}>病院・クリニック情報</th>
                            <th className={styles.th} style={{ width: '160px', textAlign: 'center' }}>AIチャット</th>
                            <th className={styles.th} style={{ width: '120px', textAlign: 'right' }}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClinics.map((clinic) => (
                            <tr key={clinic.id} style={{ transition: 'background 0.2s' }}>
                                <td className={styles.td} style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem', color: '#7e3af2' }}>#{clinic.rank}</td>
                                <td className={styles.td} style={{ textAlign: 'center' }}>
                                    <Image src={clinic.image || 'https://via.placeholder.com/60'} alt={clinic.name} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} unoptimized />
                                </td>
                                <td className={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', overflow: 'hidden' }}>
                                        <span className={styles.badge} style={{ background: getCategoryColor(clinic.category), color: getCategoryTextColor(clinic.category), fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {CLINIC_CATEGORIES.find(c => c.id === clinic.category)?.label}
                                        </span>
                                        <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clinic.name}</div>
                                    </div>
                                    <div style={{ fontSize: '1.05rem', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clinic.description}</div>
                                    {clinic.address && (
                                        <div style={{ fontSize: '0.95rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            📍 {clinic.address}
                                        </div>
                                    )}
                                </td>
                                <td className={styles.td} style={{ textAlign: 'center' }}>
                                    <span className={`${styles.badge} ${clinic.chatbotStatus === 'ACTIVE' ? styles.badgeSuccess : ''}`}
                                        style={{
                                            background: clinic.chatbotStatus === 'ACTIVE' ? '#def7ec' : '#f3f4f6',
                                            color: clinic.chatbotStatus === 'ACTIVE' ? '#03543f' : '#6b7280',
                                            padding: '6px 12px', fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap'
                                        }}>
                                        {clinic.chatbotStatus === 'ACTIVE' ? '✅ 有効' : '❌ 無効'}
                                    </span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <button
                                        className={styles.btnPrimary}
                                        style={{ fontSize: '1.2rem', padding: '0.8rem 1.8rem', borderRadius: '8px' }}
                                        onClick={() => {
                                            setFormData(clinic);
                                            setView('REGISTER');
                                        }}
                                    >編集</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredClinics.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#999', fontSize: '1.2rem', background: '#fff' }}>
                        検索結果がありません.
                    </div>
                )}
            </div>
        </div>
    );
}
