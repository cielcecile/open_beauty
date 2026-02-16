'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../hospitals.module.css';
import { CLINIC_CATEGORIES, INITIAL_CLINICS } from '@/data/clinics';

export default function HospitalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(CLINIC_CATEGORIES[0].id);
  const [clinics] = useState(INITIAL_CLINICS);

  const filteredClinics = clinics.filter((clinic) => clinic.category === activeTab);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '10px', position: 'absolute', left: 0 }}>
          &larr;
        </button>
        <h1 className={styles.title} style={{ margin: 0 }}>おすすめクリニック一覧</h1>
      </div>

      <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {CLINIC_CATEGORIES.map((category) => (
          <button key={category.id} className={`${styles.tab} ${activeTab === category.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(category.id)}>
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => (
            <div key={clinic.id} className={styles.card}>
              <div className={styles.imageArea}>
                <Image src={clinic.image} alt={clinic.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 500px" unoptimized />
                <div className={styles.rankBadge}>No. {clinic.rank}</div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>{clinic.name}</h3>
                <p className={styles.desc}>{clinic.description}</p>
                <div className={styles.tags}>
                  <span className={styles.tag}>{CLINIC_CATEGORIES.find((category) => category.id === clinic.category)?.label}</span>
                  <span className={styles.tag}>人気</span>
                  <span className={styles.tag}>日本語対応</span>
                </div>
                <Link href={`/hospitals/${clinic.id}`} className={styles.detailBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
                  詳細を見る &rarr;
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p>該当するクリニックがありません。</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
        <Link href="/admin/hospitals">管理画面（開発用）</Link>
      </div>
    </div>
  );
}
