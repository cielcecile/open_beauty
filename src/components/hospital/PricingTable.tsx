'use client';

import type { PricingItem } from '@/services/pricing';
import styles from './PricingTable.module.css';

interface PricingTableProps {
    items: PricingItem[];
    hospitalName?: string;
}

export default function PricingTable({ items, hospitalName }: PricingTableProps) {
    if (items.length === 0) return null;

    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return '無料';
        return `${price.toLocaleString()} ${currency}`;
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💰 施術メニュー・価格表</h2>
            {hospitalName && (
                <p className={styles.subtitle}>{hospitalName}の料金一覧</p>
            )}

            {/* Desktop Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>施術名</th>
                            <th>韓国価格</th>
                            <th>日本参考価格</th>
                            <th>特別割引</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className={styles.treatmentName}>{item.treatment_name}</td>
                                <td>
                                    {item.event_price ? (
                                        <div className={styles.priceCell}>
                                            <span className={styles.originalPrice}>
                                                {formatPrice(item.price_krw, 'ウォン')}
                                            </span>
                                            <span className={styles.eventPrice}>
                                                {formatPrice(item.event_price, 'ウォン')}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={styles.normalPrice}>
                                            {formatPrice(item.price_krw, 'ウォン')}
                                        </span>
                                    )}
                                </td>
                                <td className={styles.jpPrice}>
                                    {formatPrice(item.price_jpy, '円')}
                                </td>
                                <td>
                                    {item.discount_percent ? (
                                        <span className={styles.discountBadge}>
                                            -{item.discount_percent}% OFF
                                        </span>
                                    ) : (
                                        <span className={styles.noBadge}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className={styles.mobileCards}>
                {items.map((item) => (
                    <div key={item.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                            <span className={styles.treatmentName}>{item.treatment_name}</span>
                            {item.discount_percent && (
                                <span className={styles.discountBadge}>-{item.discount_percent}%</span>
                            )}
                        </div>
                        <div className={styles.mobileCardBody}>
                            <div className={styles.mobilePrice}>
                                <span className={styles.mobileLabel}>🇰🇷 韓国</span>
                                {item.event_price ? (
                                    <div>
                                        <span className={styles.originalPrice}>{formatPrice(item.price_krw, 'ウォン')}</span>
                                        <span className={styles.eventPrice}>{formatPrice(item.event_price, 'ウォン')}</span>
                                    </div>
                                ) : (
                                    <span className={styles.normalPrice}>{formatPrice(item.price_krw, 'ウォン')}</span>
                                )}
                            </div>
                            <div className={styles.mobilePrice}>
                                <span className={styles.mobileLabel}>🇯🇵 日本(参考)</span>
                                <span className={styles.jpPrice}>{formatPrice(item.price_jpy, '円')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className={styles.disclaimer}>※ 価格は変動する場合があります。最新価格はお問い合わせください。</p>
        </section>
    );
}
