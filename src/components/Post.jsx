import React from 'react';

const Post = ({
    post,
    currentUser,
    activeMenuPostId,
    setActiveMenuPostId,
    togglePin,
    handleEditPost,
    requestDeletePost,
    toggleLike,
    setCommentModal,
    handleDeleteComment,
    handleViewProfile
}) => {
    const isLiked = post.likedBy?.includes(currentUser?._id || currentUser?.id);
    const isOwner = currentUser && (String(post.userId) === String(currentUser._id || currentUser.id) || post.handle === currentUser.handle);

    return (
        <article className="post-card glass">
            <div className="post-header">
                <div
                    className="post-user"
                    onClick={() => handleViewProfile(post.handle)}
                    style={{ cursor: 'pointer' }}
                >
                    <div
                        className="avatar"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundImage: post.avatar ? `url(${post.avatar})` : '',
                            backgroundSize: 'cover'
                        }}
                    ></div>
                    <div className="user-info">
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="name">{post.user}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>• {post.time}</span>
                        </div>
                        <span className="handle">{post.handle}</span>
                    </div>
                </div>
                {isOwner && (
                    <div className="post-menu-container">
                        <button
                            className="tool-btn"
                            style={{ padding: '0.2rem 0.5rem' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === (post._id || post.id) ? null : (post._id || post.id));
                            }}
                        >
                            •••
                        </button>

                        {activeMenuPostId === (post._id || post.id) && (
                            <div className="post-options-menu glass">
                                <button className="menu-item" onClick={() => togglePin(post)}>
                                    {post.isPinned ? '📌 Desafixar' : '📌 Fixar publicação'}
                                </button>
                                <button className="menu-item" onClick={() => handleEditPost(post)}>
                                    ✏️ Editar publicação
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-item delete" onClick={(e) => {
                                    e.stopPropagation();
                                    requestDeletePost(post._id || post.id);
                                }}>
                                    🗑️ Eliminar publicação
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="post-content">
                {post.isPinned && (
                    <div className="pinned-badge">
                        📌 Publicação Fixada
                    </div>
                )}
                <p>{post.content}</p>
                {post.imageUrl && (
                    <div className="post-image-wrapper">
                        <img src={post.imageUrl} alt="Post content" className="post-image" />
                    </div>
                )}
            </div>
            <div className="post-stats">
                <button
                    onClick={() => toggleLike(post._id || post.id)}
                    className={`stat-item ${isLiked ? 'active' : ''}`}
                    style={{ color: isLiked ? 'var(--accent)' : '' }}
                >
                    {isLiked ? '❤️' : '🤍'} {post.likes}
                </button>
                <button className="stat-item" onClick={() => {
                    setCommentModal({ isOpen: true, postId: post._id || post.id, content: '' });
                }}>💬 {post.comments && typeof post.comments === 'object' ? post.comments.length : (post.comments || 0)}</button>
                <button className="stat-item" onClick={() => {
                    const postUrl = `${window.location.origin}/profile/${post.handle.replace('@', '')}/post/${post._id || post.id}`;
                    navigator.clipboard.writeText(postUrl).then(() => {
                        const btn = document.getElementById(`share-btn-${post._id || post.id}`);
                        if (btn) {
                            const originalText = btn.innerHTML;
                            btn.innerHTML = '✅ Copiado!';
                            btn.classList.add('active');
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.classList.remove('active');
                            }, 2000);
                        }
                    });
                }} id={`share-btn-${post._id || post.id}`}>🚀 Partilhar</button>
            </div>

            {post.comments && Array.isArray(post.comments) && post.comments.length > 0 && (
                <div className="post-comments-list">
                    {post.comments.map(comment => (
                        <div key={comment._id || comment.id} className="comment-item glass" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '0.8rem',
                            borderRadius: '12px',
                            marginBottom: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <span className="comment-user" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{comment.user}</span>
                                <p className="comment-content" style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{comment.content}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteComment(post._id || post.id, comment._id || comment.id)}
                                className="tool-btn"
                                style={{
                                    padding: '0.2rem 0.4rem',
                                    fontSize: '0.75rem',
                                    opacity: 0.6,
                                    background: 'transparent',
                                    marginLeft: '0.5rem'
                                }}
                                title="Eliminar comentário"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
};

export default Post;
