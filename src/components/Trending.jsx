import React from 'react';

const Trending = ({ handleViewProfile, allUsers = [], currentUser, trends = [], onTrendClick }) => {
    // Sugerir utilizadores que o utilizador atual ainda não segue
    const suggestions = allUsers
        .filter(u => {
            const uid = u._id || u.id;
            const currentUid = currentUser?._id || currentUser?.id;
            return u.handle !== currentUser?.handle && !currentUser?.followingIds?.includes(String(uid));
        })
        .slice(0, 3);

    return (
        <aside className="sidebar right-sidebar" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
            <div className="discovery-section" style={{ marginTop: '2rem' }}>
                <div className="trending-card glass" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>Tendências para ti</h4>
                    {trends.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem tendências de momento.</p>
                    ) : trends.map((trend, i) => (
                        <div key={i} className="trend-item" style={{ cursor: 'pointer' }} onClick={() => onTrendClick(trend.title)}>
                            <span className="trend-category">{trend.cat}</span>
                            <span className="trend-title" style={{ color: 'var(--primary)' }}>{trend.title}</span>
                            <span className="trend-category" style={{ fontSize: '0.7rem' }}>{trend.posts} publicações</span>
                        </div>
                    ))}
                </div>

                {suggestions.length > 0 && (
                    <div className="trending-card glass">
                        <h4 style={{ marginBottom: '1.5rem' }}>Quem seguir</h4>
                        {suggestions.map((sug, i) => (
                            <div
                                key={i}
                                className="trend-item"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
                                onClick={() => handleViewProfile(sug.handle)}
                            >
                                <div
                                    className="avatar-mini"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundImage: sug.avatarUrl ? `url(${sug.avatarUrl})` : 'linear-gradient(45deg, var(--primary), var(--accent))',
                                        backgroundColor: 'var(--primary)',
                                        borderRadius: '8px'
                                    }}
                                ></div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sug.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sug.handle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Trending;
