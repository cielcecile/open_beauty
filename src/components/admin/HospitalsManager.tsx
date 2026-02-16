'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '@/app/admin/admin.module.css';

type HospitalCategory = 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';

interface HospitalRow {
  id: string;
  name: string;
  category: HospitalCategory;
  description: string | null;
  address: string | null;
  rank: number;
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
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | HospitalCategory>('ALL');

  const [form, setForm] = useState<Partial<HospitalRow>>({
    id: undefined,
    name: '',
    category: 'DERMATOLOGY',
    description: '',
    address: '',
    rank: 1,
  });

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hospitals')
      .select('id,name,category,description,address,rank')
      .order('category', { ascending: true })
      .order('rank', { ascending: true })
      .returns<HospitalRow[]>();

    if (error) {
      console.error('Failed to load hospitals:', error);
      alert('クリニック一覧を読み込めませんでした。');
      setLoading(false);
      return;
    }

    setHospitals(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHospitals();
  }, [loadHospitals]);

  const filtered = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesQuery =
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        (hospital.description || '').toLowerCase().includes(query.toLowerCase()) ||
        (hospital.address || '').toLowerCase().includes(query.toLowerCase());

      const matchesCategory = category === 'ALL' || hospital.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, hospitals, query]);

  const resetForm = () => {
    setForm({
      id: undefined,
      name: '',
      category: 'DERMATOLOGY',
      description: '',
      address: '',
      rank: 1,
    });
  };

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
      address: form.address || null,
      rank: Number(form.rank || 1),
    };

    if (form.id) {
      const { error } = await supabase.from('hospitals').update(payload).eq('id', form.id);
      if (error) {
        console.error(error);
        alert('更新に失敗しました。');
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('hospitals').insert({
        id: crypto.randomUUID(),
        ...payload,
      });
      if (error) {
        console.error(error);
        alert('登録に失敗しました。');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    await loadHospitals();
  };

  const onDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const { error } = await supabase.from('hospitals').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('削除に失敗しました。');
      return;
    }

    await loadHospitals();
  };

  const onEdit = (hospital: HospitalRow) => {
    setForm({ ...hospital });
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div className={styles.tableContainer}>
        <div className={styles.tableControls}>
          <input
            className={styles.searchInput}
            placeholder="クリニック検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className={styles.searchInput}
            value={category}
            onChange={(event) => setCategory(event.target.value as 'ALL' | HospitalCategory)}
          >
            <option value="ALL">{CATEGORY_LABELS.ALL}</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '1rem' }}>読み込み中...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>名称</th>
                <th className={styles.th}>カテゴリ</th>
                <th className={styles.th}>住所</th>
                <th className={styles.th}>順位</th>
                <th className={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hospital) => (
                <tr key={hospital.id}>
                  <td className={styles.td}>{hospital.name}</td>
                  <td className={styles.td}>{CATEGORY_LABELS[hospital.category]}</td>
                  <td className={styles.td}>{hospital.address || '-'}</td>
                  <td className={styles.td}>{hospital.rank}</td>
                  <td className={styles.td}>
                    <button className={styles.btnPrimary} onClick={() => onEdit(hospital)}>
                      編集
                    </button>
                    <button className={styles.btnGhost} onClick={() => onDelete(hospital.id)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{form.id ? 'クリニック編集' : 'クリニック登録'}</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            className={styles.searchInput}
            placeholder="名称"
            value={form.name || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            className={styles.searchInput}
            value={form.category || 'DERMATOLOGY'}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as HospitalCategory }))}
          >
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
          <input
            className={styles.searchInput}
            placeholder="住所"
            value={form.address || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
          <textarea
            className={styles.searchInput}
            placeholder="説明"
            value={form.description || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            className={styles.searchInput}
            type="number"
            min={1}
            value={form.rank || 1}
            onChange={(event) => setForm((prev) => ({ ...prev, rank: Number(event.target.value) }))}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.btnPrimary} onClick={() => void onSave()} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            <button className={styles.btnGhost} onClick={resetForm} disabled={saving}>
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
