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
    handleViewProfile,
    handleRepost
}) => {
    const isOwner = currentUser && (String(post.userId) === String(currentUser._id || currentUser.id) || post.handle === currentUser.handle);

    const isLiked = () => {
        if (!post.reactions || !post.reactions.like) return false;
        return post.reactions.like.includes(currentUser?._id || currentUser?.id);
    };

    const hasLiked = isLiked();

    const handleLikeClick = () => {
        toggleLike(post._id || post.id, 'like');
    };

    // Função para detetar e transformar hashtags em spans clicáveis
    const renderContentWithHashtags = (content) => {
        if (!content) return null;
        const parts = content.split(/(#\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('#')) {
                return (
                    <span
                        key={i}
                        className="hashtag-link"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof window.onHashtagClick === 'function') {
                                window.onHashtagClick(part);
                            }
                        }}
                        style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <article className={`post-card glass ${post.isRepost ? 'repost-card' : ''}`}>
            {post.isRepost && (
                <div className="repost-header" style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.5rem'
                }}>
                    <span>👤</span>
                    <strong>{post.user}</strong> partilhou isto
                </div>
            )}
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
                <p>{renderContentWithHashtags(post.content)}</p>

                {/* Media Gallery / Carousel */}
                {post.media && post.media.length > 0 ? (
                    <div className="post-media-gallery" style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                        {post.media.length === 1 ? (
                            <div className="single-media-wrapper">
                                {post.media[0].type === 'video' ? (
                                    <video
                                        src={post.media[0].url}
                                        controls
                                        className="post-video"
                                        style={{ width: '100%', borderRadius: '12px' }}
                                    />
                                ) : (
                                    <img src={post.media[0].url} alt="Post content" className="post-image" />
                                )}
                            </div>
                        ) : (
                            <div className="media-carousel" style={{
                                display: 'flex',
                                overflowX: 'auto',
                                scrollSnapType: 'x mandatory',
                                gap: '10px',
                                paddingBottom: '10px'
                            }}>
                                {post.media.map((item, idx) => (
                                    <div key={idx} style={{
                                        minWidth: '100%',
                                        scrollSnapAlign: 'start',
                                        position: 'relative'
                                    }}>
                                        {item.type === 'video' ? (
                                            <video src={item.url} controls className="post-video" style={{ width: '100%', borderRadius: '12px' }} />
                                        ) : (
                                            <img src={item.url} alt={`Media ${idx}`} className="post-image" style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
                                        )}
                                        <div className="media-indicator" style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '0.7rem'
                                        }}>
                                            {idx + 1}/{post.media.length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : post.imageUrl && (
                    <div className="post-image-wrapper">
                        <img src={post.imageUrl} alt="Post content" className="post-image" />
                    </div>
                )}
            </div>
            <div className="post-stats">
                <div className="stats-left">
                    <button
                        onClick={handleLikeClick}
                        className={`stat-item ${hasLiked ? 'active' : ''}`}
                        style={{
                            color: hasLiked ? 'var(--primary)' : '',
                            fontWeight: hasLiked ? 'bold' : 'normal'
                        }}
                    >
                        {hasLiked ? '❤️' : '🤍'} Gosto
                    </button>
                    {post.reactions?.like?.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {post.reactions.like.length}
                        </span>
                    )}
                </div>
                <button className="stat-item" onClick={() => {
                    setCommentModal({ isOpen: true, postId: post._id || post.id, content: '' });
                }}>💬 {post.comments && typeof post.comments === 'object' ? post.comments.length : (post.comments || 0)}</button>
                <button className="stat-item" onClick={() => {
                    handleRepost(post._id || post.id);
                    const btn = document.getElementById(`share-btn-${post._id || post.id}`);
                    if (btn) {
                        btn.innerHTML = '✅ Partilhado!';
                        btn.classList.add('active');
                        setTimeout(() => {
                            btn.innerHTML = '🚀 Partilhar';
                            btn.classList.remove('active');
                        }, 2000);
                    }
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
