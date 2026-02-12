'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../hospitals.module.css';
import { CLINIC_CATEGORIES, INITIAL_CLINICS } from '@/data/clinics';

// In a real app, data would come from API/DB.
// For now, we use local state initialized with mock data, but changes won't persist on refresh without backend.
// To persist, we'd need Supabase or local storage. For this demo, we just read.

export default function HospitalsPage() {
    const [activeTab, setActiveTab] = useState(CLINIC_CATEGORIES[0].id);
    const [clinics] = useState(INITIAL_CLINICS);

    // Filter by category
    const filteredClinics = clinics.filter(c => c.category === activeTab);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>韓国美容クリニック・病院</h1>

            {/* Category Tabs */}
            <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                {CLINIC_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.tab} ${activeTab === cat.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(cat.id)}
                    >
                        {cat.label} ({cat.name})
                    </button>
                ))}
            </div>

            {/* List */}
            <div className={styles.list}>
                {filteredClinics.length > 0 ? (
                    filteredClinics.map((clinic) => (
                        <div key={clinic.id} className={styles.card}>
                            <div className={styles.imageArea}>
                                <Image
                                    src={clinic.image}
                                    alt={clinic.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 500px" // Optimization
                                    unoptimized // Bypass optimization to fix domain issues without restart/config
                                />
                                <div className={styles.rankBadge}>No. {clinic.rank}</div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.name}>{clinic.name}</h3>
                                <p className={styles.desc}>{clinic.description}</p>
                                <div className={styles.tags}>
                                    <span className={styles.tag}>{CLINIC_CATEGORIES.find(c => c.id === clinic.category)?.label}</span>
                                    <span className={styles.tag}>プレミアム</span>
                                    <span className={styles.tag}>日本語OK</span>
                                </div>
                                <button className={styles.detailBtn}>詳細を見る &rarr;</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                        <p>登録された病院がありません。</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
                <Link href="/admin/hospitals">管理者ページへ (Dev Only)</Link>
            </div>
        </div>
    );
}
