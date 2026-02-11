'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatBot.module.css';

interface Message {
    role: 'yuna' | 'user';
    text: string;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'yuna', text: 'こんにちは！アウルムの相談員ユナです。施術や価格について何か気になることはありますか？' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'yuna', text: data.reply || '申し訳ありません。一時的なエラーが発生しました。' }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'yuna', text: '通信エラーが発生しました。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatWidget}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatWindow}
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className={styles.chatHeader}>
                            <div className={styles.yunaAvatarMini}>
                                <Image src="/images/yuna.png" alt="Yuna" width={40} height={40} style={{ borderRadius: '50%' }} />
                            </div>
                            <div className={styles.headerInfo}>
                                <h4>AI相談員 ユナ</h4>
                                <span>🟢 オンライン</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>

                        <div className={styles.messageList} ref={scrollRef}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: m.role === 'yuna' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`${styles.message} ${m.role === 'yuna' ? styles.yunaMessage : styles.userMessage}`}
                                >
                                    {m.text}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`${styles.message} ${styles.yunaMessage}`}
                                >
                                    入力中...
                                </motion.div>
                            )}
                        </div>

                        <div className={styles.chatInputArea}>
                            <input
                                className={styles.input}
                                placeholder="メッセージを入力..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className={styles.sendBtn} onClick={handleSend} disabled={isLoading}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? (
                    <span style={{ color: 'white', fontSize: '1.5rem' }}>×</span>
                ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                )}
            </motion.button>
        </div>
    );
}
