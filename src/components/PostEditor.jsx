import React from 'react';

const PostEditor = ({
    user,
    newPostContent,
    setNewPostContent,
    mediaList = [],
    setMediaList,
    handleMediaChange,
    createPost
}) => {
    return (
        <section className="create-post glass">
            <div className="post-input-wrapper">
                <div className="avatar" style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : '', backgroundSize: 'cover' }}></div>
                <textarea
                    className="post-input"
                    placeholder="O que está a acontecer?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
            </div>

            {mediaList.length > 0 && (
                <div className="post-media-grid-preview" style={{
                    display: 'grid',
                    gridTemplateColumns: mediaList.length > 1 ? 'repeat(auto-fit, minmax(150px, 1fr))' : '1fr',
                    gap: '10px',
                    margin: '1rem 0'
                }}>
                    {mediaList.map((item, index) => (
                        <div key={index} className="post-preview-container" style={{ position: 'relative' }}>
                            <button
                                className="remove-preview"
                                onClick={() => setMediaList(prev => prev.filter((_, i) => i !== index))}
                                style={{ zIndex: 10 }}
                            >✕</button>
                            {item.type === 'video' ? (
                                <video src={item.url} className="post-preview-img" muted style={{ objectFit: 'cover', height: '100%', width: '100%', borderRadius: '12px' }} />
                            ) : (
                                <img src={item.url} alt={`Preview ${index}`} className="post-preview-img" style={{ objectFit: 'cover', height: '100%', width: '100%', borderRadius: '12px' }} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="post-actions">
                <div className="post-tools">
                    <input
                        type="file"
                        id="post-media-upload"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        onChange={handleMediaChange}
                    />
                    <label htmlFor="post-media-upload" className="tool-btn" style={{ cursor: 'pointer' }}>
                        🎬 Galeria
                    </label>
                    <button className="tool-btn">📊 Sondagem</button>
                </div>
                <button
                    onClick={createPost}
                    className="btn-primary"
                    style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1.5rem', opacity: (newPostContent || mediaList.length > 0) ? 1 : 0.5 }}
                    disabled={!newPostContent && mediaList.length === 0}
                >
                    Publicar
                </button>
            </div>
        </section>
    );
};

export default PostEditor;
