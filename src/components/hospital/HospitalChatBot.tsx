'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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

const FALLBACK_REPLY = '申し訳ありません。一時的なエラーが発生しました。後でもう一度お試しください。';

export default function HospitalChatBot({ config, hospitalName }: HospitalChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: config.welcome_message || `こんにちは！${hospitalName}の専属AIコンシェルジュです。` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
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

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || FALLBACK_REPLY }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: FALLBACK_REPLY }]);
    } finally {
      setLoading(false);
    }
  };

  if (!config.is_active) return null;

  return (
    <>
      <motion.button
        className={styles.fab}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className={styles.fabIcon}>
          <Image src="/images/yuna.png" alt="AI Consultant" width={40} height={40} style={{ borderRadius: '50%' }} />
        </div>
        <span className={styles.fabLabel}>{isOpen ? '閉じる' : 'AI相談'}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className={styles.chatHeader}>
              <div className={styles.yunaAvatarMini}>
                <Image src="/images/yuna.png" alt="Yuna" fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.chatName}>AIコンシェルジュ ユナ</div>
                <div className={styles.hospitalOwner}>{hospitalName}提携</div>
                <span className={styles.onlineStatus}>🟢 オンライン</span>
              </div>
              <button className={styles.chatClose} onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className={styles.chatMessages} ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`${styles.msgRow} ${m.role === 'user' ? styles.msgUser : styles.msgBot}`}>
                  <div className={styles.msgBubble}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className={`${styles.msgRow} ${styles.msgBot}`}>
                  <div className={styles.msgBubble}>
                    <div className={styles.dotFlashing}></div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.chatInput}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="メッセージを入力..."
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}>送信</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
