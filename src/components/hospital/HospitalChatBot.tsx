'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatbotConfig } from '@/services/chatbot';
import styles from './HospitalChatBot.module.css';

// Extend the interface locally or ensure it's in the service. 
// Assuming ChatbotConfig is defined elsewhere, but we can't easily change it if it's imported.
// Actually, we can add userId to HospitalChatBotProps or config.
// The user passed `config` which is `ChatbotConfig`.
// Let's modify HospitalChatBotProps to accept userId explicitly to avoid messing with shared type if possible,
// OR just assume config has it if we modify the caller.
// Let's add `userId` to Props for clarity.
interface HospitalChatBotProps {
    config: ChatbotConfig & { user_id?: string }; // Extend here
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

    // Load Chat History if user is logged in
    useEffect(() => {
        if (!config.user_id) return;

        const fetchHistory = async () => {
            // We need a way to fetch history. Since we don't have a direct client here with permission (RLS is technically 'true' but we need a client),
            // let's use a simple fetch to an API or assuming we can use a supabase client if we import it.
            // Ideally we should use the supabase client. 
            // To avoid adding a new dependency/file for client right now, we can use a simple GET endpoint or a server action, 
            // BUT simplest for now: Use the existing POST /api/chat endpoint with a special flag OR create a client-side supabase instance.
            // The user has 'createClient' available in other files (e.g. route.ts).
            // Let's rely on standard supabase-js which is likely installed.

            // Dynamic import to avoid SSR issues if needed, or just standard import.
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data, error } = await supabase
                .from('chat_logs')
                .select('*')
                .eq('hospital_id', config.hospital_id)
                .eq('user_id', config.user_id)
                .order('created_at', { ascending: true });

            if (data && data.length > 0) {
                const historyMessages: Message[] = data.map((log: any) => ({
                    role: log.role as 'user' | 'assistant',
                    content: log.content
                }));
                // Combine welcome message (if no history? or always keep welcome?)
                // Usually if history exists, we might show it AFTER welcome or INSTEAD.
                // Let's prepend welcome message, then history.
                setMessages([
                    { role: 'assistant', content: config.welcome_message || `こんにちは！${hospitalName}へようこそ😊 何かご質問はありますか？` },
                    ...historyMessages
                ]);
            }
        };

        fetchHistory();
    }, [config.user_id, config.hospital_id, config.welcome_message, hospitalName]);

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
                    userId: config.user_id
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
