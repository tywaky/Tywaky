import React from 'react';
import FloatingChat from './FloatingChat';

const RightSidebar = ({ currentUser, allUsers, setActiveChatUser, activeChatUser }) => {
    // Lista de contactos: pessoas que o utilizador segue ou seguidores
    const contacts = allUsers.filter(u =>
        u._id !== (currentUser?._id || currentUser?.id) &&
        (currentUser?.followingIds?.includes(String(u._id)) || (u.followersIds && u.followersIds.includes(String(currentUser?._id || currentUser?.id))))
    );

    return (
        <aside className="right-sidebar" style={{
            display: 'flex',
            flexDirection: 'column'
        }}>

            <div style={{ height: '18vh', flexShrink: 0 }}></div> {/* Spacer para alinhar verticalmente sem partir o layout Flex */}

            {/* Espaço para Publicidade (Lugar reservado) */}
            <div style={{
                padding: '1.5rem',
                opacity: 0.1,
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.8rem'
            }}>
                Espaço para Publicidade e Notícias
            </div>

            {/* A Box de Contactos (Seguidores) - FOCO PRINCIPAL */}
            <div className="contacts-box glass" style={{
                margin: '0 1rem',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid var(--glass-border)',
                flexShrink: 0
            }}>
                <div style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                        <span>👥</span> Contactos
                    </h3>
                </div>

                <div className="contacts-list" style={{
                    padding: '0.4rem',
                    overflowY: 'auto',
                    maxHeight: '220px' // Mais curta verticalmente como pedido
                }}>
                    {contacts.length === 0 ? (
                        <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.75rem', padding: '1rem' }}>
                            Sem contactos.
                        </p>
                    ) : (
                        contacts.map(contact => (
                            <div
                                key={contact._id}
                                className="contact-item"
                                onClick={() => {
                                    setActiveChatUser(contact);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.7rem',
                                    padding: '0.5rem 0.8rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                            >
                                <div
                                    className="avatar-mini-circle"
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundImage: contact.avatarUrl ? `url(${contact.avatarUrl})` : '',
                                        backgroundColor: 'var(--primary)',
                                        backgroundSize: 'cover',
                                        flexShrink: 0,
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        width: '7px',
                                        height: '7px',
                                        backgroundColor: '#4ade80',
                                        border: '1px solid var(--bg-dark)',
                                        borderRadius: '50%'
                                    }}></div>
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.8rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {contact.name}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ padding: '1rem', fontSize: '0.65rem', opacity: 0.3, textAlign: 'center' }}>
                Messenger v1.2
            </div>

            {/* Espaçador flexível para empurrar a janela para o fundo da sidebar */}
            <div style={{ flex: 1 }}></div>

            {/* Chat Flutuante no Fluxo Normal (Garante margens e larguras idênticas à contacts-box) */}
            {activeChatUser && (
                <div style={{
                    margin: '0 1rem', // Exatamente a mesma margem descrita na contacts-box
                    marginBottom: '1rem',
                    flexShrink: 0
                }}>
                    <FloatingChat
                        currentUser={currentUser}
                        chatUser={activeChatUser}
                        onClose={() => setActiveChatUser(null)}
                    />
                </div>
            )}
        </aside>
    );
};

export default RightSidebar;
