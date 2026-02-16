'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '@/app/admin/admin.module.css';
import { useAuth } from '@/context/AuthContext';

type HospitalCategory = 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';

interface HospitalRow {
  id: string;
  name: string;
  category: HospitalCategory;
  description: string | null;
  detail_description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
  rank: number;
  image: string | null;
}

const CATEGORY_OPTIONS: HospitalCategory[] = ['DERMATOLOGY', 'PLASTIC', 'DENTISTRY', 'ORIENTAL'];
const CATEGORY_LABELS: Record<'ALL' | HospitalCategory, string> = {
  ALL: 'すべて',
  DERMATOLOGY: '皮膚科',
  PLASTIC: '美容外科',
  DENTISTRY: '歯科',
  ORIENTAL: '韓方',
};

export default function HospitalsManager() {
  const { session } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | HospitalCategory>('ALL');
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState<Partial<HospitalRow>>({
    id: undefined,
    name: '',
    category: 'DERMATOLOGY',
    description: '',
    detail_description: '',
    address: '',
    phone: '',
    website: '',
    opening_hours: '',
    rank: 1,
    image: '',
  });

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('category', { ascending: true })
      .order('rank', { ascending: true })
      .returns<HospitalRow[]>();

    if (error) {
      console.error('Failed to load hospitals:', error);
      setLoading(false);
      return;
    }

    setHospitals(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const filtered = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesQuery =
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        (hospital.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'ALL' || hospital.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, hospitals, query]);

  const onSave = async () => {
    if (!form.name || !form.category) {
      alert('名称とカテゴリは必須です。');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || null,
      detail_description: form.detail_description || null,
      address: form.address || null,
      phone: form.phone || null,
      website: form.website || null,
      opening_hours: form.opening_hours || null,
      rank: Number(form.rank || 1),
      image: form.image || null,
    };

    if (form.id) {
      const { error } = await supabase.from('hospitals').update(payload).eq('id', form.id);
      if (error) {
        alert('更新に失敗しました: ' + error.message);
      } else {
        alert('更新完了');
        setEditMode(false);
      }
    } else {
      const { error } = await supabase.from('hospitals').insert({
        id: crypto.randomUUID(),
        ...payload,
      });
      if (error) {
        alert('登録に失敗しました: ' + error.message);
      } else {
        alert('登録完了');
        setEditMode(false);
      }
    }

    setSaving(false);
    await loadHospitals();
  };

  const handleIngest = async (hospitalId: string) => {
    if (!confirm('AIの知識を更新しますか？')) return;
    setIngesting(hospitalId);
    try {
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ hospitalId })
      });
      const res = await response.json();
      if (res.success) {
        alert(`AI知識の更新完了: ${res.chunksProcessed}個のデータを学習しました。`);
      } else {
        throw new Error(res.error || '更新失敗');
      }
    } catch (err) {
      alert('エラー: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIngesting(null);
    }
  };

  const onEdit = (hospital: HospitalRow) => {
    setForm({ ...hospital });
    setEditMode(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    await supabase.from('hospitals').delete().eq('id', id);
    await loadHospitals();
  };

  if (editMode) {
    return (
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className={styles.cardTitle}>{form.id ? 'クリニック編集' : 'クリニック登録'}</h3>
          <button className={styles.btnGhost} onClick={() => setEditMode(false)}>キャンセル</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className={styles.label}>クリニック名</label>
            <input className={styles.searchInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

            <label className={styles.label}>カテゴリ</label>
            <select className={styles.searchInput} value={form.category} onChange={e => setForm({ ...form, category: e.target.value as HospitalCategory })}>
              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{CATEGORY_LABELS[opt]}</option>)}
            </select>

            <label className={styles.label}>住所</label>
            <input className={styles.searchInput} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />

            <label className={styles.label}>画像URL (Unsplash等)</label>
            <input className={styles.searchInput} value={form.image || ''} onChange={e => setForm({ ...form, image: e.target.value })} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className={styles.label}>電話番号</label>
            <input className={styles.searchInput} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label className={styles.label}>ウェブサイト</label>
            <input className={styles.searchInput} value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />

            <label className={styles.label}>営業案内</label>
            <input className={styles.searchInput} value={form.opening_hours || ''} onChange={e => setForm({ ...form, opening_hours: e.target.value })} />

            <label className={styles.label}>表示順位 (Rank)</label>
            <input type="number" className={styles.searchInput} value={form.rank} onChange={e => setForm({ ...form, rank: Number(e.target.value) })} />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className={styles.label}>短い紹介文</label>
          <input className={styles.searchInput} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />

          <label className={styles.label}>詳細な説明 (AI学習に使用)</label>
          <textarea className={styles.searchInput} style={{ height: '150px' }} value={form.detail_description || ''} onChange={e => setForm({ ...form, detail_description: e.target.value })} />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={onSave} disabled={saving}>{saving ? '保存中...' : 'クリニック保存'}</button>
          {form.id && (
            <button
              className={styles.btnPrimary}
              style={{ background: 'var(--c-main)', color: '#333', flex: 1 }}
              onClick={() => handleIngest(form.id!)}
              disabled={ingesting === form.id}
            >
              {ingesting === form.id ? 'AI学習 중...' : '🔥 AI 知識同期'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.tableContainer}>
        <div className={styles.tableControls}>
          <input className={styles.searchInput} placeholder="クリニック検索" value={query} onChange={e => setQuery(e.target.value)} />
          <select className={styles.searchInput} value={category} onChange={e => setCategory(e.target.value as any)}>
            <option value="ALL">すべてのカテゴリ</option>
            {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{CATEGORY_LABELS[opt]}</option>)}
          </select>
          <button className={styles.btnPrimary} style={{ minWidth: '150px' }} onClick={() => { setForm({ id: undefined, name: '', category: 'DERMATOLOGY', rank: 1 }); setEditMode(true); }}>
            + クリニック登録
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>順位</th>
              <th className={styles.th}>クリニック名</th>
              <th className={styles.th}>カテゴリ</th>
              <th className={styles.th}>住所</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(hospital => (
              <tr key={hospital.id}>
                <td className={styles.td} style={{ fontWeight: 'bold', textAlign: 'center' }}>{hospital.rank}</td>
                <td className={styles.td} style={{ fontWeight: '700', color: 'var(--c-accent)' }}>{hospital.name}</td>
                <td className={styles.td}>{CATEGORY_LABELS[hospital.category]}</td>
                <td className={styles.td}>{hospital.address || '-'}</td>
                <td className={styles.td}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.btnPrimary} onClick={() => onEdit(hospital)}>編集</button>
                    <button
                      className={styles.btnGhost}
                      style={{ color: '#666', fontSize: '0.8rem' }}
                      onClick={() => handleIngest(hospital.id)}
                      disabled={ingesting === hospital.id}
                    >
                      {ingesting === hospital.id ? 'AI...' : 'AI同期'}
                    </button>
                    <button className={styles.btnGhost} style={{ color: 'var(--c-danger)' }} onClick={() => onDelete(hospital.id)}>削除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
