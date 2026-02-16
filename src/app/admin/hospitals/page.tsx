import { Suspense } from 'react';
import HospitalsManager from '@/components/admin/HospitalsManager';
import styles from '../admin.module.css';

export default function AdminHospitalsPage() {
  return (
    <div>
      <div className={styles.tableContainer}>
        <Suspense fallback={<div style={{ padding: '2rem' }}>読み込み中...</div>}>
          <HospitalsManager />
        </Suspense>
      </div>
    </div>
  );
}
