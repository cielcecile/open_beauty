'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '../admin.module.css';

interface Treatment {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    price?: string;
    time?: string;
    downtime?: string;
    concern_type?: string;
}

export default function TreatmentsPage() {
    const { user } = useAuth();
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Treatment>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({});

    // Fetch treatments
    useEffect(() => {
        fetchTreatments();
    }, []);

    const fetchTreatments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('treatments')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching treatments:', error);
                alert('データの読み込みに失敗しました。');
                return;
            }

            if (data) {
                setTreatments(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Update treatment
    const handleUpdate = async (id: string) => {
        if (!editForm.name) {
            alert('施術名は必須です。');
            return;
        }

        try {
            // 업데이트할 데이터: name, concern_type, description만
            const updateData = {
                name: editForm.name,
                concern_type: editForm.concern_type || null,
                description: editForm.description || ''
            };

            console.log('Updating with:', updateData);

            const { error, data } = await supabase
                .from('treatments')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) {
                console.error('Error details:', error);
                alert(`更新に失敗しました: ${error.message}`);
                return;
            }

            console.log('Update successful');

            // 현재 리스트에서 수정된 항목 직접 업데이트
            if (data && data[0]) {
                setTreatments(treatments.map(t =>
                    t.id === id ? data[0] : t
                ));
            }

            setEditingId(null);
            setEditForm({});
            alert('施術情報を更新しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('エラーが発生しました。');
        }
    };

    // Delete treatment
    const handleDelete = async (id: string) => {
        if (!confirm('この施術を削除しますか？')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('treatments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting treatment:', error);
                alert('削除に失敗しました。');
                return;
            }

            // リストから直接削除
            setTreatments(treatments.filter(t => t.id !== id));
            alert('施術を削除しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    // Add new treatment
    const handleAddTreatment = async () => {
        if (!newTreatment.name) {
            alert('施術名は必須です。');
            return;
        }

        try {
            const { error, data } = await supabase
                .from('treatments')
                .insert({
                    name: newTreatment.name,
                    description: newTreatment.description || '',
                    image_url: newTreatment.image_url || null,
                    price: newTreatment.price || null,
                    time: newTreatment.time || null,
                    downtime: newTreatment.downtime || null,
                    concern_type: newTreatment.concern_type || null,
                })
                .select();

            if (error) {
                console.error('Error adding treatment:', error);
                alert('追加に失敗しました。');
                return;
            }

            // リストに新しい項目を追加
            if (data && data[0]) {
                setTreatments([...treatments, data[0]]);
            }

            setNewTreatment({});
            setIsAdding(false);
            alert('新しい施術を追加しました。');
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    if (!user) {
        return <div style={{ padding: '2rem' }}>ログインが必要です。</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>💉 施術管理</h2>
                <button
                    className={isAdding ? styles.btnSecondary : styles.btnSuccess}
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? 'キャンセル' : '✨ 新規追加'}
                </button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>✨ 新しい施術を追加</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>施術名</label>
                            <input
                                type="text"
                                placeholder="例: シュリンク・ユニバース"
                                value={newTreatment.name || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>関心タイプ</label>
                            <select
                                value={newTreatment.concern_type || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, concern_type: e.target.value })}
                            >
                                <option value="">関心タイプを選択</option>
                                <option value="たるみ/弾력">たるみ/弾力</option>
                                <option value="シワ">シワ</option>
                                <option value="毛穴/傷跡">毛穴/傷跡</option>
                                <option value="シミ/肝斑">シミ/肝斑</option>
                                <option value="ニキビ">ニキビ</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>価格</label>
                            <input
                                type="text"
                                placeholder="例: 99,000ウォン~"
                                value={newTreatment.price || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>施術時間</label>
                            <input
                                type="text"
                                placeholder="例: 20分"
                                value={newTreatment.time || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, time: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>説明</label>
                        <textarea
                            placeholder="説明を入力してください..."
                            value={newTreatment.description || ''}
                            onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                            style={{ minHeight: '120px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>画像URL</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={newTreatment.image_url || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, image_url: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--admin-text-second)', fontWeight: '700', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ダウンタイム</label>
                            <input
                                type="text"
                                placeholder="例: 即時メイク可能"
                                value={newTreatment.downtime || ''}
                                onChange={(e) => setNewTreatment({ ...newTreatment, downtime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end' }}>
                        <button className={styles.btnSecondary} onClick={() => setIsAdding(false)}>キャンセル</button>
                        <button className={styles.btnPrimary} onClick={handleAddTreatment}>施術を登録する</button>
                    </div>
                </div>
            )}

            {/* Treatments Table */}
            {isLoading ? (
                <div>読み込み中...</div>
            ) : treatments.length === 0 ? (
                <div>施術がありません。</div>
            ) : (
                <div className={styles.tableContainer} style={{ borderRadius: '12px' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>施術名</th>
                                    <th className={styles.th}>関心タイプ</th>
                                    <th className={styles.th}>説明</th>
                                    <th className={styles.th}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {treatments.map((treatment) => (
                                    <tr key={treatment.id} style={{ borderBottom: '1px solid #eee' }}>
                                        {editingId === treatment.id ? (
                                            <>
                                                <td className={styles.td}>
                                                    <input
                                                        type="text"
                                                        value={editForm.name || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                </td>
                                                <td className={styles.td}>
                                                    <select
                                                        value={editForm.concern_type || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, concern_type: e.target.value })}
                                                    >
                                                        <option value="">選択してください</option>
                                                        <option value="たるみ/弾力">たるみ/弾力</option>
                                                        <option value="シワ">シワ</option>
                                                        <option value="毛穴/傷跡">毛穴/傷跡</option>
                                                        <option value="シミ/肝斑">シミ/肝斑</option>
                                                        <option value="ニキビ">ニキビ</option>
                                                    </select>
                                                </td>
                                                <td className={styles.td}>
                                                    <textarea
                                                        value={editForm.description || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                                    />
                                                </td>
                                                <td className={styles.td}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            className={styles.btnSuccess}
                                                            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                                                            onClick={() => handleUpdate(treatment.id)}
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            className={styles.btnSecondary}
                                                            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            キャンセル
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className={styles.td}><strong>{treatment.name}</strong></td>
                                                <td className={styles.td}>{treatment.concern_type || '-'}</td>
                                                <td className={styles.td}>
                                                    <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem', color: 'var(--admin-text-second)' }}>
                                                        {treatment.description || '-'}
                                                    </div>
                                                </td>
                                                <td className={styles.td}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            className={styles.btnPrimary}
                                                            style={{ fontSize: '0.9rem', padding: '6px 16px', borderRadius: '8px' }}
                                                            onClick={() => {
                                                                setEditingId(treatment.id);
                                                                setEditForm({
                                                                    name: treatment.name,
                                                                    concern_type: treatment.concern_type,
                                                                    description: treatment.description
                                                                });
                                                            }}
                                                        >
                                                            編集
                                                        </button>
                                                        <button
                                                            className={styles.btnDanger}
                                                            style={{ fontSize: '0.9rem', padding: '6px 16px', borderRadius: '8px' }}
                                                            onClick={() => handleDelete(treatment.id)}
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
