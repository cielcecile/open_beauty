'use client';

import HospitalsManager from '@/components/admin/HospitalsManager';
import styles from '../admin.module.css';

export default function AdminHospitalsPage() {
    return (
        <div>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>登録病院管理</h1>
                <button className={styles.btnPrimary}>+ 新規追加</button>
            </header>
            <div className={styles.tableContainer}>
                <HospitalsManager />
            </div>
        </div>
    );
}
