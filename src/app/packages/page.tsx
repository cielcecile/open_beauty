'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './packages.module.css';

// Types
type Category = 'FLIGHT' | 'HOTEL' | 'TOUR' | 'ESIM' | 'WIFI';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
    { id: 'FLIGHT', label: '航空券 (Flight)', icon: '✈️' },
    { id: 'HOTEL', label: 'ホテル (Hotel)', icon: '🏨' },
    { id: 'TOUR', label: 'ツアー・体験', icon: '🎟️' },
    { id: 'ESIM', label: 'eSIM・SIM', icon: '📶' },
    { id: 'WIFI', label: 'Wi-Fiレンタル', icon: '📡' },
];

const AFFILIATE_LINKS: { [key in Category]: any[] } = {
    FLIGHT: [
        {
            title: "Trip.com (トリップドットコム)",
            desc: "世界最大級のオンライン旅行会社。お得な航空券が見つかります。",
            link: "https://jp.trip.com/",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop",
            tag: "定番"
        },
        {
            title: "Skyscanner (スカイスキャナー)",
            desc: "約1200社から最安値を一括比較！",
            link: "https://www.skyscanner.jp/",
            image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=400&h=200&fit=crop",
            tag: "比較"
        }
    ],
    HOTEL: [
        {
            title: "Agoda (アゴダ)",
            desc: "韓国ホテルの品揃え最強。直前予約もお得。",
            link: "https://www.agoda.com/",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
            tag: "人気"
        },
        {
            title: "Rakuten Travel (楽天トラベル)",
            desc: "楽天ポイントが貯まる・使える。安心の日本語サポート。",
            link: "https://travel.rakuten.co.jp/",
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
            tag: "ポイント"
        }
    ],
    TOUR: [
        {
            title: "Klook (クルック)",
            desc: "韓国の入場チケットやスパ、体験予約ならここ。",
            link: "https://www.klook.com/ja/",
            image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop",
            tag: "割引あり"
        },
        {
            title: "KKday (ケーケーデイ)",
            desc: "現地オプショナルツアーが豊富。交通パスも。",
            link: "https://www.kkday.com/ja",
            image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=400&h=200&fit=crop",
            tag: "体験"
        }
    ],
    ESIM: [
        {
            title: "Airalo (エラロ)",
            desc: "世界中で使えるeSIMアプリ。即時開通で便利。",
            link: "https://www.airalo.com/ja",
            image: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=200&fit=crop",
            tag: "eSIM"
        },
        {
            title: "Ubigi (ユビジ)",
            desc: "高品質なデータ通信。日本出発前に設定可能。",
            link: "https://cellulardata.ubigi.com/ja/",
            image: "https://images.unsplash.com/photo-1562860149-691401a306f8?w=400&h=200&fit=crop",
            tag: "簡単"
        }
    ],
    WIFI: [
        {
            title: "Global Wi-Fi (グローバルWiFi)",
            desc: "空港受取・返却可能。安心の定額制。",
            link: "https://townwifi.com/",
            image: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=400&h=200&fit=crop",
            tag: "安心"
        }
    ]
};

export default function PackagesPage() {
    const [activeCategory, setActiveCategory] = useState<Category>('FLIGHT');

    return (
        <div className={styles.container}>
            <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                ✈️ 韓国旅行 必須準備リスト
            </motion.h1>

            <motion.p
                style={{ textAlign: 'center', marginBottom: '3rem', color: '#666' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                美容旅行を完璧にするための<br className={styles.mobileBreak} />
                おすすめ予約サイトを厳選しました。
            </motion.p>

            {/* Category Tabs */}
            <div className={styles.categoryTabs}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <span className={styles.tabIcon}>{cat.icon}</span>
                        <span className={styles.tabLabel}>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <motion.div
                key={activeCategory}
                className={styles.packageGrid}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {AFFILIATE_LINKS[activeCategory].map((item, idx) => (
                    <motion.div
                        key={idx}
                        className={styles.packageCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        {item.tag && <div className={styles.rankBadge}>{item.tag}</div>}
                        <img src={item.image} alt={item.title} className={styles.packageImage} />
                        <div className={styles.packageContent}>
                            <h3 className={styles.packageTitle}>{item.title}</h3>
                            <p className={styles.packageDesc}>{item.desc}</p>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.affiliateButton}
                            >
                                サイトを見る &rarr;
                            </a>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className={styles.disclaimer}>
                <p>※ 上記のリンクは提携パートナーサイトへ移動します。</p>
                <p>※ 予約・購入に関するお問い合わせは各サービス提供会社へお願いします。</p>
            </div>
        </div>
    );
}
