'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHospital } from '@/services/hospitals';
import { getPricing } from '@/services/pricing';
import { getReviews, getAverageRating } from '@/services/reviews';
import { getFAQs } from '@/services/faqs';
import { getChatbotConfig } from '@/services/chatbot';
import type { Hospital } from '@/services/hospitals';
import type { PricingItem } from '@/services/pricing';
import type { Review } from '@/services/reviews';
import type { FAQ } from '@/services/faqs';
import type { ChatbotConfig } from '@/services/chatbot';
import HospitalHeader from '@/components/hospital/HospitalHeader';
import PricingTable from '@/components/hospital/PricingTable';
import FAQAccordion from '@/components/hospital/FAQAccordion';
import ReviewList from '@/components/hospital/ReviewList';
import BookingSection from '@/components/hospital/BookingSection';
import HospitalChatBot from '@/components/hospital/HospitalChatBot';
import { useAuth } from '@/context/AuthContext';
import styles from './hospital-detail.module.css';

export default function HospitalDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user } = useAuth();

    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [pricing, setPricing] = useState<PricingItem[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [faqs, setFAQs] = useState<FAQ[]>([]);
    const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [hospitalData, pricingData, reviewsData, faqsData, chatbotData] = await Promise.all([
                    getHospital(id),
                    getPricing(id),
                    getReviews(id),
                    getFAQs(id),
                    getChatbotConfig(id),
                ]);

                if (!hospitalData) {
                    setError('クリニック情報が見つかりませんでした。');
                    return;
                }

                setHospital(hospitalData);
                setPricing(pricingData);
                setReviews(reviewsData);
                setFAQs(faqsData);
                setChatbotConfig(chatbotData);
            } catch {
                setError('データの読み込みに失敗しました。もう一度お試しください。');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>読み込み中...</p>
            </div>
        );
    }

    if (error || !hospital) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorIcon}>😢</p>
                <p className={styles.errorText}>{error || 'クリニック情報が見つかりませんでした。'}</p>
                <button className={styles.retryBtn} onClick={() => window.history.back()}>
                    ← 戻る
                </button>
            </div>
        );
    }

    const avgRating = getAverageRating(reviews);

    return (
        <div className={styles.page}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* 1. Hospital Header */}
                <HospitalHeader
                    hospital={hospital}
                    averageRating={avgRating}
                    reviewCount={reviews.length}
                />

                {/* 2. Pricing Table */}
                <PricingTable items={pricing} hospitalName={hospital.name} />

                {/* 3. FAQ Accordion */}
                <FAQAccordion faqs={faqs} />

                {/* 4. Reviews */}
                <ReviewList reviews={reviews} />

                {/* 5. Booking CTA */}
                <BookingSection hospitalId={hospital.id} hospitalName={hospital.name} />
            </motion.div>

            {/* 6. Hospital-specific ChatBot (floating) */}
            {chatbotConfig && (
                <HospitalChatBot
                    config={{ ...chatbotConfig, user_id: user?.id }}
                    hospitalName={hospital.name}
                />
            )}
        </div>
    );
}
