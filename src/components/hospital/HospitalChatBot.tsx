'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ChatbotConfig } from '@/services/chatbot';
import styles from './HospitalChatBot.module.css';

interface HospitalChatBotProps {
  config: ChatbotConfig & { user_id?: string };
  hospitalName: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatLogRow {
  role: 'user' | 'assistant';
  content: string;
}

const FALLBACK_REPLY = '現在回答が遅れています。しばらくしてから再度お試しください。';

export default function HospitalChatBot({ config, hospitalName }: HospitalChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: config.welcome_message || `${hospitalName}のご相談をお手伝いします。` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!config.user_id) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    const loadHistory = async () => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase
        .from('chat_logs')
        .select('role,content')
        .eq('hospital_id', config.hospital_id)
        .eq('user_id', config.user_id)
        .order('created_at', { ascending: true })
        .returns<ChatLogRow[]>();

      if (!data || data.length === 0) return;

      setMessages([
        { role: 'assistant', content: config.welcome_message || `${hospitalName}のご相談をお手伝いします。` },
        ...data.map((row) => ({ role: row.role, content: row.content })),
      ]);
    };

    void loadHistory();
  }, [config.hospital_id, config.user_id, config.welcome_message, hospitalName]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          hospitalId: config.hospital_id,
          systemPrompt: config.system_prompt,
          hospitalName,
          userId: config.user_id,
        }),
      });

      const payload = (await response.json()) as { reply?: string };
      setMessages((prev) => [...prev, { role: 'assistant', content: payload.reply || FALLBACK_REPLY }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: FALLBACK_REPLY }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  if (!config.is_active) return null;

  return (
    <>
      <button className={styles.fab} onClick={() => setIsOpen((prev) => !prev)} aria-label="クリニック相談チャットを開く">
        {isOpen ? '×' : '相談'}
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <span className={styles.chatAvatar}>AI</span>
              <div>
                <div className={styles.chatName}>{hospitalName}</div>
                <div className={styles.chatStatus}>対応中</div>
              </div>
            </div>
            <button className={styles.chatClose} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className={styles.chatMessages} ref={scrollRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${styles.msgRow} ${message.role === 'user' ? styles.msgUser : styles.msgBot}`}
              >
                <div className={styles.msgBubble}>{message.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.msgRow} ${styles.msgBot}`}>
                <div className={`${styles.msgBubble} ${styles.typing}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力してください"
              disabled={loading}
            />
            <button onClick={() => void sendMessage()} disabled={loading || !input.trim()}>
              送信
            </button>
          </div>
        </div>
      )}
    </>
  );
}
