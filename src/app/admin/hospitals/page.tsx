'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CLINIC_CATEGORIES, INITIAL_CLINICS, Clinic } from '@/data/clinics';
import styles from '../../hospitals.module.css';

export default function AdminHospitalsPage() {
    // Basic CRUD simulation
    const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Clinic>>({
        name: '',
        category: 'DERMATOLOGY',
        description: '',
        image: 'https://images.unsplash.com/photo-1549488352-7f991f866418?w=600&h=400&fit=crop',
        rank: 1
    });

    const handleRankChange = (id: string, newRank: number) => {
        // Simple reorder logic not implemented fully for drag/drop, but manual rank edit
        setClinics(clinics.map(c => c.id === id ? { ...c, rank: newRank } : c).sort((a, b) => a.rank - b.rank));
    };

    const handleSave = () => {
        if (!formData.name || !formData.category) return alert('名前とカテゴリは必須です');
        const newClinic: Clinic = {
            id: Date.now().toString(),
            name: formData.name,
            category: formData.category as any,
            description: formData.description || '',
            image: formData.image || '',
            rank: formData.rank || clinics.length + 1
        };
        setClinics([...clinics, newClinic].sort((a, b) => a.rank - b.rank));
        setFormData({ name: '', category: 'DERMATOLOGY', description: '', rank: clinics.length + 2, image: '' });
        alert('追加しました (ブラウザをリロードすると消えます)');
    };

    const handleDelete = (id: string) => {
        if (confirm('削除しますか？')) {
            setClinics(clinics.filter(c => c.id !== id));
        }
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>病院情報管理 (Admin)</h1>
            <p style={{ textAlign: 'center', color: 'red', marginBottom: '1rem' }}>※ 現在はデモ用の仮データです。DB連動は未実装。</p>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                <h3>新規登録</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        placeholder="病院名 (例: ○○皮膚科)"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                        style={{ padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        {CLINIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <textarea
                        placeholder="説明"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        style={{ padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="number"
                            placeholder="順位"
                            value={formData.rank}
                            onChange={e => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                            style={{ padding: '0.8rem', width: '80px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
                            登録する
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {clinics.map((clinic) => (
                    <div key={clinic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', background: 'white', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', width: '30px' }}>#{clinic.rank}</span>
                            <div>
                                <strong>{clinic.name}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>{CLINIC_CATEGORIES.find(c => c.id === clinic.category)?.label}</span>
                                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{clinic.description?.substring(0, 30)}...</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleDelete(clinic.id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>削除</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link href="/hospitals" style={{ textDecoration: 'underline' }}>&larr; リストページに戻る</Link>
            </div>
        </div>
    );
}
