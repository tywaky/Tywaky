import React from 'react';

const RightSidebar = ({ currentUser, allUsers, setCurrentView, setActiveChatUser }) => {
    // Lista de contactos: pessoas que o utilizador segue ou seguidores
    const contacts = allUsers.filter(u =>
        u._id !== (currentUser?._id || currentUser?.id) &&
        (currentUser?.followingIds?.includes(String(u._id)) || (u.followersIds && u.followersIds.includes(String(currentUser?._id || currentUser?.id))))
    );

    return (
        <aside className="right-sidebar glass" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Espaço Superior: Reservado para Publicidade / Patrocínios / Notícias */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '100px', opacity: 0.2 }}>
                <div style={{ border: '1px dashed var(--text-muted)', width: '100%', height: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Espaço para Publicidade e Notícias</span>
                </div>
            </div>

            {/* A Box de Contactos (Seguidores) no Quadrado Vermelho (Em baixo) */}
            <div className="contacts-box glass" style={{
                margin: '1rem',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👥</span> Contactos
                    </h3>
                </div>

                <div className="contacts-list" style={{
                    padding: '0.5rem',
                    overflowY: 'auto',
                    maxHeight: '400px'
                }}>
                    {contacts.length === 0 ? (
                        <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', padding: '1rem' }}>
                            Sem contactos ativos.
                        </p>
                    ) : (
                        contacts.map(contact => (
                            <div
                                key={contact._id}
                                className="contact-item"
                                onClick={() => {
                                    setActiveChatUser(contact);
                                    setCurrentView('messages');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                            >
                                <div
                                    className="avatar-mini-circle"
                                    style={{
                                        width: '32px',
                                        height: '32px',
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
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#4ade80',
                                        border: '1.5px solid var(--bg-dark)',
                                        borderRadius: '50%'
                                    }}></div>
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.85rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {contact.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                        {contact.handle}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ padding: '0.5rem', fontSize: '0.7rem', opacity: 0.3, textAlign: 'center' }}>
                Tywaky Messenger v1.1
            </div>
        </aside>
    );
};

export default RightSidebar;
