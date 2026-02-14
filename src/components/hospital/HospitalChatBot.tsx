'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatbotConfig } from '@/services/chatbot';
import styles from './HospitalChatBot.module.css';

interface HospitalChatBotProps {
    config: ChatbotConfig;
    hospitalName: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function HospitalChatBot({ config, hospitalName }: HospitalChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: config.welcome_message || `こんにちは！${hospitalName}へようこそ😊 何かご質問はありますか？` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    hospitalId: config.hospital_id,
                    systemPrompt: config.system_prompt,
                    hospitalName,
                }),
            });

            const data = await res.json();
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.reply || 'すみません、現在応答できません。LINEでお問い合わせください。' }
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: '通信エラーが発生しました。しばらくしてからもう一度お試しください。' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!config.is_active) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                className={styles.fab}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="チャットを開く"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.chatHeaderInfo}>
                            <span className={styles.chatAvatar}>🏥</span>
                            <div>
                                <div className={styles.chatName}>{hospitalName}</div>
                                <div className={styles.chatStatus}>オンライン</div>
                            </div>
                        </div>
                        <button className={styles.chatClose} onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className={styles.chatMessages} ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgUser : styles.msgBot}`}>
                                <div className={styles.msgBubble}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.msgRow} ${styles.msgBot}`}>
                                <div className={`${styles.msgBubble} ${styles.typing}`}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chatInput}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="メッセージを入力..."
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()}>
                            送信
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
