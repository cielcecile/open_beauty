'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './packages.module.css';

type Category = 'FLIGHT' | 'HOTEL' | 'TOUR' | 'ESIM' | 'WIFI';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'FLIGHT', label: '航空券', icon: 'FL' },
  { id: 'HOTEL', label: 'ホテル', icon: 'HT' },
  { id: 'TOUR', label: 'ツアー', icon: 'TR' },
  { id: 'ESIM', label: 'eSIM', icon: 'ES' },
  { id: 'WIFI', label: 'Wi-Fi', icon: 'WF' },
];

interface AffiliateItem {
  title: string;
  desc: string;
  link: string;
  image: string;
  tag?: string;
}

const AFFILIATE_LINKS: Record<Category, AffiliateItem[]> = {
  FLIGHT: [
    { title: 'Trip.com', desc: '韓国行きの航空券を検索・比較できます。', link: 'https://jp.trip.com/', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop', tag: '人気' },
    { title: 'Skyscanner', desc: '複数サイトを横断比較できる定番サービス。', link: 'https://www.skyscanner.jp/', image: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=400&h=200&fit=crop', tag: '比較' },
  ],
  HOTEL: [
    { title: 'Agoda', desc: 'ソウルのホテルを価格帯別に比較可能。', link: 'https://www.agoda.com/', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop', tag: '定番' },
    { title: 'Rakuten Travel', desc: '日本語UIで予約しやすいホテル検索。', link: 'https://travel.rakuten.co.jp/', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop', tag: '日本語' },
  ],
  TOUR: [
    { title: 'Klook', desc: '現地体験・送迎・チケット予約に便利です。', link: 'https://www.klook.com/ja/', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop', tag: '体験' },
    { title: 'KKday', desc: '韓国旅行向けの日程プランを探せます。', link: 'https://www.kkday.com/ja', image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=400&h=200&fit=crop', tag: '日程' },
  ],
  ESIM: [
    { title: 'Airalo', desc: '旅行向けeSIMを即時購入して利用できます。', link: 'https://www.airalo.com/ja', image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=200&fit=crop', tag: 'eSIM' },
    { title: 'Ubigi', desc: '安定したデータ通信を提供するeSIM。', link: 'https://cellulardata.ubigi.com/ja/', image: 'https://images.unsplash.com/photo-1562860149-691401a306f8?w=400&h=200&fit=crop', tag: '通信' },
  ],
  WIFI: [
    { title: 'Global Wi-Fi', desc: 'ポケットWi-Fiレンタルの代表サービス。', link: 'https://townwifi.com/', image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=400&h=200&fit=crop', tag: 'レンタル' },
  ],
};

export default function PackagesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('FLIGHT');

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '10px', position: 'absolute', left: 0 }}>&larr;</button>
        <motion.h1 className={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0 }}>旅行サポートリンク</motion.h1>
      </div>

      <motion.p style={{ textAlign: 'center', marginBottom: '3rem', color: '#666' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        韓国美容旅行の準備に役立つリンクをまとめました。
      </motion.p>

      <div className={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.activeTab : ''}`} onClick={() => setActiveCategory(cat.id)}>
            <span className={styles.tabIcon}>{cat.icon}</span>
            <span className={styles.tabLabel}>{cat.label}</span>
          </button>
        ))}
      </div>

      <motion.div key={activeCategory} className={styles.packageGrid} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {AFFILIATE_LINKS[activeCategory].map((item) => (
          <motion.div key={item.title} className={styles.packageCard} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {item.tag && <div className={styles.rankBadge}>{item.tag}</div>}
            <Image src={item.image} alt={item.title} className={styles.packageImage} width={400} height={200} unoptimized />
            <div className={styles.packageContent}>
              <h3 className={styles.packageTitle}>{item.title}</h3>
              <p className={styles.packageDesc}>{item.desc}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.affiliateButton}>サイトへ移動 →</a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className={styles.disclaimer}>
        <p>本リンクは利便性のために提供しています。</p>
        <p>価格・在庫・特典は各サービス提供元の最新情報をご確認ください。</p>
      </div>
    </div>
  );
}
