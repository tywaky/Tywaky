import React from 'react';

const Modals = ({
    isEditingProfile, setIsEditingProfile, editData, setEditData, handleFileChange, saveProfile,
    editingPost, setEditingPost, saveEditedPost,
    confirmModal, setConfirmModal, deletePost,
    commentModal, setCommentModal, handleAddComment
}) => {
    return (
        <>
            {/* Modal Edição Perfil */}
            {isEditingProfile && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h3>Editar Perfil</h3>
                            <button onClick={() => setIsEditingProfile(false)} className="tool-btn">✕</button>
                        </div>

                        <div className="input-group">
                            <label>Nome</label>
                            <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        </div>

                        <div className="input-group">
                            <label>Bio (Máx. 500 caracteres)</label>
                            <textarea
                                className="post-input glass"
                                style={{ padding: '0.8rem', borderRadius: '12px', minHeight: '80px' }}
                                value={editData.bio}
                                maxLength="500"
                                onChange={e => setEditData({ ...editData, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <label>Foto de Perfil (Avatar)</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'avatarUrl')} style={{ padding: '0.5rem 0' }} />
                            <div className="input-preview" style={{ height: '80px', width: '80px', borderRadius: '50%' }}>
                                {editData.avatarUrl ? <img src={editData.avatarUrl} alt="Preview" /> : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem foto</span>}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Imagem de Capa (Banner)</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'bannerUrl')} style={{ padding: '0.5rem 0' }} />
                            <div className="input-preview">
                                {editData.bannerUrl ? <img src={editData.bannerUrl} alt="Preview" /> : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem banner</span>}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setIsEditingProfile(false)} className="tool-btn" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={saveProfile} className="btn-primary" style={{ flex: 2, marginTop: 0 }}>Guardar Alterações</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edição de Post */}
            {editingPost && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h3>Editar Publicação</h3>
                            <button onClick={() => setEditingPost(null)} className="tool-btn">✕</button>
                        </div>
                        <div className="input-group">
                            <label>Conteúdo da Publicação</label>
                            <textarea
                                className="post-input glass"
                                style={{ padding: '1rem', borderRadius: '12px', minHeight: '120px', width: '100%', color: 'white', marginBottom: '1rem' }}
                                value={editingPost.content}
                                onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <label>Imagem da Publicação</label>
                            {editingPost.imageUrl ? (
                                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                    <img
                                        src={editingPost.imageUrl}
                                        alt="Post media"
                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                                    />
                                    <button
                                        onClick={() => setEditingPost({ ...editingPost, imageUrl: null })}
                                        className="tool-btn"
                                        style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                                        title="Remover imagem"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ) : (
                                <div className="image-upload-placeholder glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '12px', marginBottom: '1rem', border: '2px dashed var(--glass-border)' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Sem imagem nesta publicação</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setEditingPost({ ...editingPost, imageUrl: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setEditingPost(null)} className="tool-btn" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={saveEditedPost} className="btn-primary" style={{ flex: 2, marginTop: 0 }}>Guardar Alterações</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Eliminação */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Eliminar Publicação</h3>
                            <button onClick={() => setConfirmModal({ isOpen: false, postId: null })} className="tool-btn">✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <p>Tens a certeza que queres eliminar esta publicação? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="modal-footer" style={{ gap: '1rem' }}>
                            <button onClick={() => setConfirmModal({ isOpen: false, postId: null })} className="tool-btn" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={deletePost} className="btn-primary" style={{ flex: 1, marginTop: 0, backgroundColor: '#ff4b4b', border: 'none' }}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Comentário */}
            {commentModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h3>Adicionar Comentário</h3>
                        <textarea
                            className="post-input"
                            placeholder="Escreva o seu comentário..."
                            value={commentModal.content}
                            onChange={(e) => setCommentModal({ ...commentModal, content: e.target.value })}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="tool-btn" onClick={() => setCommentModal({ isOpen: false, postId: null, content: '' })}>Cancelar</button>
                            <button className="tool-btn" onClick={handleAddComment}>Publicar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modals;
