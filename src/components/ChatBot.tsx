'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatBot.module.css';
import { useChat } from '@/context/ChatContext';

interface Message {
    role: 'yuna' | 'user';
    text: string;
}

export default function ChatBot() {
    const { isOpen, closeChat } = useChat();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'yuna', text: 'こんにちは！アウルムの相談員ユナです。施術や価格について何か気になることはありますか？' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Close when route changes (optional)
    useEffect(() => {
        // Automatically scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]); // Added isOpen to dependency

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
                        className={styles.chatWidget}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.chatWindow}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside window
                        >
                            <div className={styles.chatHeader}>
                                <div className={styles.yunaAvatarMini}>
                                    <Image src="/images/yuna.png" alt="Yuna" fill style={{ objectFit: 'cover' }} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h4>AI相談員 ユナ</h4>
                                    <span>🟢 オンライン</span>
                                </div>
                                <button onClick={closeChat} className={styles.closeBtn}>×</button>
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
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </motion.div>
                        {/* Background backdrop click to close could be added here if needed, currently pointer-events: none on container prevents it unless we add a specific backdrop div */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} onClick={closeChat}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
