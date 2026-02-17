'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Input,
    Button,
    Avatar,
    Badge,
    Typography,
    Space,
    Spin
} from 'antd';
import {
    SendOutlined,
    CloseOutlined,
    CustomerServiceOutlined,
    LoadingOutlined
} from '@ant-design/icons';
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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

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
        } catch (err) {
            console.error('chat send error:', err);
            setMessages(prev => [...prev, { role: 'yuna', text: '通信エラーが発生しました。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                            style={{
                                background: '#fff',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                                border: '1px solid #f0f0f0'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.chatHeader} style={{
                                background: '#fff',
                                padding: '16px 20px',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Space size="middle">
                                    <Badge dot color="green" offset={[-4, 32]}>
                                        <Avatar
                                            src="/images/yuna.png"
                                            size={40}
                                            icon={<CustomerServiceOutlined />}
                                            style={{ border: '2px solid #D4AF37' }}
                                        />
                                    </Badge>
                                    <div>
                                        <Typography.Text strong style={{ display: 'block' }}>AI相談員 ユナ</Typography.Text>
                                        <Typography.Text type="secondary" style={{ fontSize: '11px' }}>🟢 オンライン</Typography.Text>
                                    </div>
                                </Space>
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={closeChat}
                                    shape="circle"
                                />
                            </div>

                            <div className={styles.messageList} ref={scrollRef} style={{ padding: '20px', background: '#fafafa' }}>
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={m.role === 'yuna' ? styles.yunaMessage : styles.userMessage}
                                        style={{
                                            marginBottom: '10px',
                                            padding: '10px 16px',
                                            borderRadius: m.role === 'yuna' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                                            maxWidth: '85%',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            alignSelf: m.role === 'yuna' ? 'flex-start' : 'flex-end',
                                            background: m.role === 'yuna' ? '#fff' : '#D4AF37',
                                            color: m.role === 'yuna' ? '#333' : '#fff',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                            border: m.role === 'yuna' ? '1px solid #eee' : 'none'
                                        }}
                                    >
                                        {m.text}
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div style={{ padding: '10px' }}>
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 18, color: '#D4AF37' }} spin />} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.chatInputArea} style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="メッセージを入力..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onPressEnter={handleSend}
                                        style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}
                                    />
                                </Space.Compact>
                            </div>
                        </motion.div>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} onClick={closeChat}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
