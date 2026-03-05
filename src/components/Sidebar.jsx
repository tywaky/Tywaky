import React from 'react';

const Sidebar = ({ currentView, setCurrentView, user, handleLogout, setViewedProfile }) => {
    return (
        <aside className="sidebar">
            <div
                style={{ padding: '1rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => {
                    setViewedProfile(null);
                    setCurrentView('feed');
                }}
            >
                <img src="/assets/logo.png" alt="Tywaky Logo" style={{ width: '100px', height: 'auto', objectFit: 'contain' }} />
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={() => {
                        setViewedProfile(null);
                        setCurrentView('feed');
                    }}
                    className={`nav-link ${currentView === 'feed' ? 'active' : ''}`}
                >
                    <span>🏠</span> Início
                </button>
                <button className="nav-link"><span>🔍</span> Explorar</button>
                <button className="nav-link"><span>🔔</span> Notificações</button>
                <button className="nav-link"><span>✉️</span> Mensagens</button>
                <button
                    onClick={() => {
                        setViewedProfile(null);
                        setCurrentView('profile');
                    }}
                    className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
                >
                    <span>👤</span> Perfil
                </button>
                {user?.isAdmin && (
                    <button
                        onClick={() => {
                            setViewedProfile(null);
                            setCurrentView('admin');
                        }}
                        className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
                        style={{ color: '#fbbf24' }}
                    >
                        <span>🛡️</span> Painel Admin
                    </button>
                )}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', cursor: 'pointer' }}
                    onClick={() => setCurrentView('profile')}
                >
                    <div
                        className="avatar"
                        style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : '', backgroundSize: 'cover' }}
                    ></div>
                    <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{user?.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.handle}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="tool-btn" style={{ width: '100%' }}>Sair</button>
            </div>
        </aside>
    );
};

export default Sidebar;
