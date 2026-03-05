import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/api';

const FloatingChat = ({ currentUser, chatUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        if (!chatUser || !currentUser) return;
        try {
            const res = await apiClient.get(`/messages/${chatUser._id || chatUser.id}?userId=${currentUser._id || currentUser.id}`);
            if (res.success) {
                setMessages(res.messages);
            }
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
        }
    }, [chatUser, currentUser]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            senderId: currentUser._id || currentUser.id,
            receiverId: chatUser._id || chatUser.id,
            content: newMessage
        };

        try {
            const res = await apiClient.post('/messages', msgData);
            if (res.success) {
                setMessages([...messages, res.message]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
        }
    };

    if (!chatUser) return null;

    return (
        <div className="floating-chat-window glass" style={{
            position: 'fixed',
            bottom: '20px',
            right: '340px', // Ao lado do RightSidebar
            width: '320px',
            height: '450px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px 16px 0 0'
        }}>
            {/* Header */}
            <div style={{
                padding: '0.8rem 1rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px 16px 0 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div className="avatar-mini-circle" style={{
                        width: '30px',
                        height: '30px',
                        backgroundImage: chatUser.avatarUrl ? `url(${chatUser.avatarUrl})` : '',
                        backgroundSize: 'cover',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)'
                    }}></div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{chatUser.name}</span>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
                >
                    &times;
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
            }}>
                {messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
                        Diz olá a {chatUser.name}!
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = String(msg.senderId) === String(currentUser._id || currentUser.id);
                        return (
                            <div
                                key={msg._id || msg.id}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '0.6rem 1rem',
                                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    fontSize: '0.85rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                {msg.content}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    placeholder="Escreve uma mensagem..."
                    className="glass"
                    style={{
                        width: '100%',
                        padding: '0.6rem 1rem',
                        borderRadius: '20px',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    autoFocus
                />
            </form>
        </div>
    );
};

export default FloatingChat;
