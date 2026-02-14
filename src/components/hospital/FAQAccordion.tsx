'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQ } from '@/services/faqs';
import styles from './FAQAccordion.module.css';

interface FAQAccordionProps {
    faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    if (faqs.length === 0) return null;

    const toggle = (id: string) => {
        setOpenId(prev => prev === id ? null : id);
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>❓ よくあるご質問</h2>
            <div className={styles.faqList}>
                {faqs.map((faq) => (
                    <div key={faq.id} className={styles.faqItem}>
                        <button
                            className={`${styles.question} ${openId === faq.id ? styles.open : ''}`}
                            onClick={() => toggle(faq.id)}
                        >
                            <span className={styles.questionText}>{faq.question}</span>
                            <span className={styles.chevron}>{openId === faq.id ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence>
                            {openId === faq.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className={styles.answerWrap}
                                >
                                    <p className={styles.answer}>{faq.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
