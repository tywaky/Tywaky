import React from 'react';

const Trending = ({ handleViewProfile, allUsers = [], currentUser }) => {
    const trends = [];

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
                    {trends.map((trend, i) => (
                        <div key={i} className="trend-item">
                            <span className="trend-category">{trend.cat}</span>
                            <span className="trend-title">{trend.title}</span>
                            <span className="trend-category" style={{ fontSize: '0.7rem' }}>{trend.posts} posts</span>
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
                                        backgroundImage: sug.avatarUrl ? `url(${sug.avatarUrl})` : '',
                                        backgroundColor: 'var(--primary)'
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
