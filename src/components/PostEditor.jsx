import React from 'react';

const PostEditor = ({ user, newPostContent, setNewPostContent, newPostImage, setNewPostImage, handlePostImageChange, createPost }) => {
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

            {newPostImage && (
                <div className="post-preview-container">
                    <button className="remove-preview" onClick={() => setNewPostImage(null)}>✕</button>
                    <img src={newPostImage} alt="Post preview" className="post-preview-img" />
                </div>
            )}

            <div className="post-actions">
                <div className="post-tools">
                    <input
                        type="file"
                        id="post-image-upload"
                        accept="image/*"
                        hidden
                        onChange={handlePostImageChange}
                    />
                    <label htmlFor="post-image-upload" className="tool-btn" style={{ cursor: 'pointer' }}>
                        🖼️ Foto
                    </label>
                    <button className="tool-btn">📊 Sondagem</button>
                </div>
                <button
                    onClick={createPost}
                    className="btn-primary"
                    style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1.5rem', opacity: (newPostContent || newPostImage) ? 1 : 0.5 }}
                    disabled={!newPostContent && !newPostImage}
                >
                    Publicar
                </button>
            </div>
        </section>
    );
};

export default PostEditor;
