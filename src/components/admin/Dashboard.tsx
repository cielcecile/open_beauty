'use client';

import { useEffect } from 'react';
import styles from '@/app/admin/admin.module.css';

const STATS = [
  { label: '本日の訪問数', value: '1,284', change: '+12%' },
  { label: '予約件数', value: '856', change: '+8%' },
  { label: '売上合計', value: '12,450,000 KRW', change: '+24%' },
  { label: '平均予約単価', value: '14,500 KRW', change: '+5%' },
];

const RESERVATIONS = [
  { id: '1', hospital: 'Aureum Clinic', patient: 'Sato Yuki', date: '2026-02-14 14:00', service: 'Lifting 300shot', amount: '350,000 KRW', status: '予約確定' },
  { id: '2', hospital: 'Lienjang', patient: 'Tanaka Mei', date: '2026-02-15 10:30', service: 'Nose Filler', amount: '1,200,000 KRW', status: '保留中' },
  { id: '3', hospital: 'White Dental', patient: 'Ito Hana', date: '2026-02-15 16:00', service: 'Whitening', amount: '150,000 KRW', status: '完了' },
];

export default function AdminDashboard() {
  useEffect(() => {
    document.title = 'ダッシュボード | Open Beauty 管理者';
  }, []);

  return (
    <div style={{ padding: '0 0.5rem' }}>
      <div className={styles.statsGrid}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.card} style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <strong>{stat.label}</strong>
              <span className={styles.badge}>{stat.change}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableControls} style={{ background: '#fff', padding: '1.5rem 2rem' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}>最新予約一覧</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>クリニック</th>
                <th className={styles.th}>患者</th>
                <th className={styles.th}>日時</th>
                <th className={styles.th}>施術</th>
                <th className={styles.th}>金額</th>
                <th className={styles.th}>状態</th>
              </tr>
            </thead>
            <tbody>
              {RESERVATIONS.map((row) => (
                <tr key={row.id}>
                  <td className={styles.td}>#{row.id}</td>
                  <td className={styles.td}>{row.hospital}</td>
                  <td className={styles.td}>{row.patient}</td>
                  <td className={styles.td}>{row.date}</td>
                  <td className={styles.td}>{row.service}</td>
                  <td className={styles.td}>{row.amount}</td>
                  <td className={styles.td}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

