import React, { useEffect } from 'react';

const NotificationsView = ({ notifications, markNotificationsAsRead, handleViewProfile }) => {
    useEffect(() => {
        markNotificationsAsRead();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'like': return '❤️';
            case 'comment': return '💬';
            case 'follow': return '👤';
            case 'message': return '✉️';
            default: return '🔔';
        }
    };

    const getMessage = (notification) => {
        switch (notification.type) {
            case 'like': return 'gostou da tua publicação';
            case 'comment': return `comentou: "${notification.content?.substring(0, 30)}${notification.content?.length > 30 ? '...' : ''}"`;
            case 'follow': return 'começou a seguir-te';
            case 'message': return 'enviou-te uma mensagem';
            default: return 'fez uma interação';
        }
    };

    return (
        <div className="notifications-container glass" style={{ marginTop: '1rem', padding: '1.5rem', minHeight: '80vh' }}>
            <h2 style={{ marginBottom: '2rem' }}>Notificações</h2>

            <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                        <p>Ainda não tens notificações.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif._id}
                            className={`notification-item glass ${!notif.read ? 'unread' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: notif.read ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--primary)',
                                background: notif.read ? 'transparent' : 'rgba(79, 70, 229, 0.1)',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                            onClick={() => handleViewProfile(notif.sender.handle)}
                        >
                            <div className="notif-icon" style={{ fontSize: '1.5rem' }}>
                                {getIcon(notif.type)}
                            </div>
                            <div
                                className="avatar-mini"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundImage: notif.sender.avatarUrl ? `url(${notif.sender.avatarUrl})` : '',
                                    flexShrink: 0
                                }}
                            ></div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    <span style={{ fontWeight: 700 }}>{notif.sender.name}</span> {getMessage(notif)}
                                </p>
                                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                    {new Date(notif.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsView;
