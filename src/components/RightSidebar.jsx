import React from 'react';

const RightSidebar = ({ currentUser, allUsers, setCurrentView, handleViewProfile, setActiveChatUser }) => {
    // Lista de contactos: pessoas que o utilizador segue ou seguidores
    const contacts = allUsers.filter(u =>
        u._id !== (currentUser?._id || currentUser?.id) &&
        (currentUser?.followingIds?.includes(String(u._id)) || (u.followersIds && u.followersIds.includes(String(currentUser?._id || currentUser?.id))))
    );

    return (
        <aside className="right-sidebar glass">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>👥</span> Contactos
                </h3>
            </div>

            <div className="contacts-list" style={{ padding: '0.5rem', overflowY: 'auto', flex: 1 }}>
                {contacts.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '2rem' }}>
                        Segue alguém para começar a conversar!
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
                                padding: '0.8rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            <div
                                className="avatar-mini-circle"
                                style={{
                                    width: '35px',
                                    height: '35px',
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
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: '#4ade80',
                                    border: '2px solid var(--bg-dark)',
                                    borderRadius: '50%'
                                }}></div>
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <span style={{ fontWeight: 500, fontSize: '0.9rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {contact.name}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {contact.handle}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', opacity: 0.5, textAlign: 'center' }}>
                Tywaky Messenger v1.0
            </div>
        </aside>
    );
};

export default RightSidebar;
