'use client';

import HospitalsManager from '@/components/admin/HospitalsManager';
import styles from '../admin.module.css';

export default function AdminHospitalsPage() {
    return (
        <div>
            <div className={styles.tableContainer}>
                <HospitalsManager />
            </div>
        </div>
    );
}
