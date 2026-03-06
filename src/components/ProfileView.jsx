import React from 'react';

const ProfileView = ({
    user,
    isOwnProfile,
    currentUser,
    posts,
    activeMenuPostId,
    setActiveMenuPostId,
    togglePin,
    handleEditPost,
    requestDeletePost,
    toggleLike,
    setCommentModal,
    PostComponent,
    openEditModal,
    handleDeleteComment,
    handleFollow,
    handleUnfollow,
    handleViewProfile,
    setActiveChatUser
}) => {
    const isFollowing = currentUser?.followingIds?.includes(String(user?._id || user?.id));
    const normalizedUserId = user?._id || user?.id;
    const normalizedCurrentUserId = currentUser?._id || currentUser?.id;
    const effectiveIsOwnProfile = isOwnProfile || normalizedUserId === normalizedCurrentUserId;

    return (
        <div className="profile-view">
            <header className="profile-header glass" style={{
                backgroundImage: user?.bannerUrl ? `url(${user.bannerUrl})` : 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
                marginBottom: '4rem'
            }}>
                <div className="avatar-large" style={{
                    backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : '',
                    backgroundColor: 'var(--primary)'
                }}></div>
            </header>

            <div className="profile-info glass" style={{ padding: '2rem', marginTop: '-2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{user?.name}</h2>
                        <span style={{ color: 'var(--text-muted)' }}>{user?.handle}</span>
                    </div>
                    {effectiveIsOwnProfile ? (
                        <button onClick={openEditModal} className="tool-btn" style={{ border: '1px solid var(--glass-border)', padding: '0.6rem 1.5rem', borderRadius: '12px' }}>Editar Perfil</button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!effectiveIsOwnProfile && (
                                <button
                                    onClick={() => setActiveChatUser(user)}
                                    className="tool-btn"
                                    style={{ border: '1px solid var(--glass-border)', padding: '0.6rem 1.5rem', borderRadius: '12px' }}
                                >
                                    ✉️ Mensagem
                                </button>
                            )}
                            <button
                                onClick={() => isFollowing ? handleUnfollow(normalizedUserId) : handleFollow(normalizedUserId)}
                                className={`tool-btn ${isFollowing ? '' : 'active'}`}
                                style={{
                                    background: isFollowing ? 'transparent' : 'white',
                                    color: isFollowing ? 'white' : 'black',
                                    border: '1px solid var(--glass-border)',
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isFollowing ? 'A seguir' : 'Seguir'}
                            </button>
                        </div>
                    )}
                </div>

                <p style={{ margin: '1.5rem 0', lineHeight: 1.6, maxWidth: '600px' }}>{user?.bio}</p>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="stat-badges">
                        <strong>{user?.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>A seguir</span>
                    </div>
                    <div className="stat-badges">
                        <strong>{user?.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>Seguidores</span>
                    </div>
                </div>

                <div className="auth-tabs" style={{ justifyContent: 'flex-start', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                    <button className="tab-btn active">Posts</button>
                    <button className="tab-btn">Respostas</button>
                    <button className="tab-btn">Media</button>
                    <button className="tab-btn">Gostos</button>
                </div>
            </div>

            <div className="profile-posts" style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>
                    {effectiveIsOwnProfile ? 'As tuas publicações' : `Publicações de ${user?.name}`}
                </h4>
                {posts.filter(p => (p.userId === normalizedUserId || p.handle === user?.handle)).length > 0 ? (
                    posts.filter(p => (p.userId === normalizedUserId || p.handle === user?.handle)).map(post => (
                        <PostComponent
                            key={post._id || post.id}
                            post={post}
                            currentUser={currentUser}
                            activeMenuPostId={activeMenuPostId}
                            setActiveMenuPostId={setActiveMenuPostId}
                            togglePin={togglePin}
                            handleEditPost={handleEditPost}
                            requestDeletePost={requestDeletePost}
                            toggleLike={toggleLike}
                            setCommentModal={setCommentModal}
                            handleDeleteComment={handleDeleteComment}
                            handleViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <p>{effectiveIsOwnProfile ? 'Aqui aparecerão os teus posts.' : 'Este utilizador ainda não tem publicações.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileView;
