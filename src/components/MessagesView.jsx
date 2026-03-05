import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api';

const MessagesView = ({ user, initialRecipient }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (initialRecipient) {
            setActiveConversation({
                userId: initialRecipient._id || initialRecipient.id,
                user: initialRecipient
            });
        }
    }, [initialRecipient]);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Atualiza lista a cada 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.userId);
            const interval = setInterval(() => fetchMessages(activeConversation.userId), 3000); // Chat mais rápido: 3s
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await apiClient.get(`/conversations?userId=${user._id || user.id}`);
            if (res.success) {
                setConversations(res.conversations);
            }
        } catch (err) {
            console.error('Erro ao carregar conversas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const res = await apiClient.get(`/messages/${otherUserId}?userId=${user._id || user.id}`);
            if (res.success) {
                setMessages(res.messages);
            }
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const msgData = {
            senderId: user._id || user.id,
            receiverId: activeConversation.userId,
            content: newMessage
        };

        try {
            const res = await apiClient.post('/messages', msgData);
            if (res.success) {
                setMessages([...messages, res.message]);
                setNewMessage('');
                fetchConversations(); // Atualiza a última mensagem na lista
            }
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
        }
    };

    return (
        <div className="messages-container glass" style={{ display: 'flex', height: '80vh', marginTop: '1rem', overflow: 'hidden' }}>
            {/* Lista de Conversas */}
            <div className="conversations-sidebar" style={{ width: '350px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <h3 style={{ margin: 0 }}>Mensagem Privada</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', opacity: 0.5 }}>A carregar...</p>
                    ) : conversations.length === 0 ? (
                        <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Ainda não tens conversas.</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.userId}
                                onClick={() => setActiveConversation(conv)}
                                className={`conversation-item ${activeConversation?.userId === conv.userId ? 'active' : ''}`}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    marginBottom: '0.2rem',
                                    backgroundColor: activeConversation?.userId === conv.userId ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                            >
                                <div className="avatar" style={{ width: '45px', height: '45px', backgroundImage: conv.user.avatarUrl ? `url(${conv.user.avatarUrl})` : '', flexShrink: 0 }}></div>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <span style={{ fontWeight: 600 }}>{conv.user.name}</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                {activeConversation ? (
                    <>
                        <div className="chat-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="avatar" style={{ width: '35px', height: '35px', backgroundImage: activeConversation.user.avatarUrl ? `url(${activeConversation.user.avatarUrl})` : '' }}></div>
                            <div>
                                <h4 style={{ margin: 0 }}>{activeConversation.user.name}</h4>
                                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{activeConversation.user.handle}</span>
                            </div>
                        </div>

                        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map(msg => {
                                const isMe = String(msg.senderId) === String(user._id || user.id);
                                return (
                                    <div
                                        key={msg._id || msg.id}
                                        style={{
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            padding: '0.8rem 1.2rem',
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {msg.content}
                                        <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.3rem', textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Escreve uma mensagem..."
                                    className="glass"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '25px', border: 'none', color: 'white' }}
                                />
                                <button type="submit" className="btn-primary" style={{ marginTop: 0, padding: '0 1.5rem', borderRadius: '25px' }}>
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
                        <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</span>
                        <h3>Seleciona uma conversa para começar</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesView;
