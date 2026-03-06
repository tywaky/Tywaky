import { useState, useEffect } from 'react'
import './App.css'
import { apiClient } from './services/api'
import Sidebar from './components/Sidebar'
import Trending from './components/Trending'
import Post from './components/Post'
import PostEditor from './components/PostEditor'
import ProfileView from './components/ProfileView'
import Modals from './components/Modals'
import AdminPanel from './components/AdminPanel'
import RightSidebar from './components/RightSidebar'
import NotificationsView from './components/NotificationsView'
import { io } from 'socket.io-client'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('feed')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState({ name: '', bio: '', avatarUrl: '', bannerUrl: '' })
  const [posts, setPosts] = useState([])
  const [visiblePosts, setVisiblePosts] = useState(6)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, postId: null })
  const [commentModal, setCommentModal] = useState({ isOpen: false, postId: null, content: '' })
  const [viewedProfile, setViewedProfile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [authData, setAuthData] = useState({ name: '', handle: '', email: '', password: '', confirmPassword: '' })
  const [authErrors, setAuthErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load/Refresh Data
  const fetchData = async () => {
    try {
      const savedUser = localStorage.getItem('tywaky_user');
      const postsData = await apiClient.get('/posts');
      const usersData = await apiClient.get('/users');
      setAllUsers(usersData);

      // Refresh current user data if logged in
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const currentUserData = usersData.find(u => u.handle === parsedUser.handle || u.email === parsedUser.email);
        if (currentUserData) {
          setUser(currentUserData);
          localStorage.setItem('tywaky_user', JSON.stringify(currentUserData));
        }
      }

      // Refresh viewed profile if active
      setViewedProfile(prev => {
        if (!prev) return null;
        const updatedViewed = usersData.find(u => u.handle === prev.handle || u.email === prev.email);
        return updatedViewed || prev;
      });

      const FallbackPosts = [];
      const rawPosts = (Array.isArray(postsData) && postsData.length > 0 ? postsData : FallbackPosts);

      // Enrich posts with user data
      const enrichedPosts = rawPosts.map(post => {
        if (!post.user && post.userId) {
          const postUser = usersData.find(u => (u._id === post.userId || u.id === post.userId));
          if (postUser) {
            return {
              ...post,
              user: postUser.name,
              handle: postUser.handle,
              avatar: postUser.avatarUrl,
              userId: postUser._id
            };
          }
        }
        return post;
      }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Falha ao sincronizar dados:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get(`/notifications?userId=${user._id || user.id}`);
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await apiClient.put('/api/notifications/read', { userId: user._id || user.id });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Erro ao marcar notificações como lidas:', err);
    }
  };

  useEffect(() => {
    // Initial Load
    fetchData();

    setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    const handleClickOutside = () => setActiveMenuPostId(null);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [])

  // Socket Connection & Listeners
  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('setup', user._id || user.id);
      fetchNotifications();

      newSocket.on('notification_received', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Opcional: Efeito sonoro ou toast
        console.log('Nova notificação:', newNotif);
      });

      newSocket.on('message_received', (newMsg) => {
        // Se a vista atual for 'feed' ou outra, podemos querer mostrar um badge ou notificação
        console.log('Nova mensagem via socket:', newMsg);
        // Se o chat estiver aberto com este utilizador, ele já atualiza via polling ou listener próprio
        // Mas podemos forçar refresh das conversas
      });

      newSocket.on('post_created', (newPost) => {
        // Evitar duplicados se for o próprio autor (que já adiciona localmente)
        setPosts(prev => {
          const exists = prev.find(p => String(p._id || p.id) === String(newPost._id || newPost.id));
          if (exists) return prev;
          return [newPost, ...prev].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        });
      });

      return () => newSocket.disconnect();
    }
  }, [user?._id, user?.id]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email é obrigatório';
      else if (!emailRegex.test(value)) error = 'Formato de email inválido';
    } else if (name === 'password') {
      if (!value) error = 'Palavra-passe é obrigatória';
      else if (value.length < 6) error = 'Mínimo de 6 caracteres';
    } else if (name === 'confirmPassword') {
      if (value !== authData.password) error = 'As palavras-passe não coincidem';
    } else if (name === 'handle') {
      if (authMode === 'register') {
        if (!value) error = 'Handle é obrigatório';
        else if (!/^@[a-zA-Z0-9_]+$/.test(value)) error = 'Formato inválido (ex: @user_123)';
      }
    } else if (name === 'name') {
      if (authMode === 'register' && !value) error = 'Nome é obrigatório';
    }
    setAuthErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAuth = async (e) => {
    e.preventDefault()

    // Final validation
    const fieldsToValidate = authMode === 'login' ? ['email', 'password'] : ['name', 'handle', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, authData[field])) isValid = false;
    });

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const res = await apiClient.post('/auth/login', { email: authData.email, password: authData.password })
        if (res.success) {
          setUser(res.user)
          setIsLoggedIn(true)
          localStorage.setItem('tywaky_user', JSON.stringify(res.user))
          localStorage.setItem('tywaky_token', res.token)
        }
      } else {
        const newUser = {
          id: Date.now(),
          name: authData.name,
          email: authData.email,
          password: authData.password,
          handle: authData.handle,
          bio: 'Novo na Tywaky!',
          followers: 0,
          following: 0,
          avatarUrl: '',
          bannerUrl: ''
        }
        const res = await apiClient.post('/auth/register', newUser)
        if (res.success) {
          setUser(res.user)
          setIsLoggedIn(true)
          localStorage.setItem('tywaky_user', JSON.stringify(res.user))
          localStorage.setItem('tywaky_token', res.token)
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error)
      setAuthErrors(prev => ({ ...prev, form: error.message || 'Credenciais inválidas ou erro de rede.' }))
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tywaky_user')
    localStorage.removeItem('tywaky_token')
    setIsLoggedIn(false)
    setUser(null)
  }

  const handlePostImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPostImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const createPost = async () => {
    if (!newPostContent.trim() && !newPostImage) return
    const post = {
      userId: user._id || user.id, // CRITICAL: Enviar o ID do utilizador
      user: user.name,
      handle: user.handle,
      content: newPostContent,
      avatar: user.avatarUrl,
      imageUrl: newPostImage || '',
      likes: 0,
      liked: false,
      comments: [],
      time: 'Agora',
      isPinned: false
    }
    try {
      const savedPost = await apiClient.post('/posts', post)
      // Usar o post retornado pelo server (que tem o ID real do MongoDB)
      setPosts([savedPost, ...posts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)))
      setNewPostContent('')
      setNewPostImage(null)
      setActiveMenuPostId(null)
    } catch (error) {
      console.error('Erro ao publicar:', error)
      alert('Erro ao publicar. Verifica a tua ligação.')
    }
  }


  const handleAddComment = async () => {
    if (!commentModal.content.trim()) return;
    const newComment = {
      id: Date.now(),
      user: user.name,
      content: commentModal.content,
      time: 'Agora'
    };
    try {
      await apiClient.post(`/posts/${commentModal.postId}/comments`, newComment);
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === commentModal.postId) {
          const currentComments = Array.isArray(p.comments) ? p.comments : [];
          return { ...p, comments: [...currentComments, newComment] };
        }
        return p;
      }));
      setCommentModal({ isOpen: false, postId: null, content: '' });
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
    }
  }; const handleDeleteComment = async (postId, commentId) => {
    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          const currentComments = Array.isArray(p.comments) ? p.comments : [];
          return { ...p, comments: currentComments.filter(c => c.id !== commentId) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao eliminar comentário:', err);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!isLoggedIn) return;
    try {
      const res = await apiClient.post(`/user/${targetUserId}/follow`, { userId: user._id || user.id });
      if (res.success) {
        // Sync with server data to ensure stats are correct
        const updatedFollowingIds = res.user?.followingIds || [...(user.followingIds || []), String(targetUserId)];
        const uniqueIds = [...new Set(updatedFollowingIds)];

        const updatedUser = {
          ...user,
          following: uniqueIds.length,
          followingIds: uniqueIds
        };
        setUser(updatedUser);
        localStorage.setItem('tywaky_user', JSON.stringify(updatedUser));

        // Refresh all data to sync other user's followers
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao seguir:', error);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    if (!isLoggedIn) return;
    try {
      const res = await apiClient.post(`/user/${targetUserId}/unfollow`, { userId: user._id || user.id });
      if (res.success) {
        const updatedFollowingIds = (user.followingIds || []).filter(id => id !== String(targetUserId));
        const updatedUser = {
          ...user,
          following: updatedFollowingIds.length,
          followingIds: updatedFollowingIds
        };
        setUser(updatedUser);
        localStorage.setItem('tywaky_user', JSON.stringify(updatedUser));
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
    }
  };

  const handleViewProfile = async (handle) => {
    if (handle === user.handle) {
      setViewedProfile(null);
      setCurrentView('profile');
      return;
    }

    try {
      const res = await apiClient.get(`/user/handle/${handle}`);
      if (res.success) {
        setViewedProfile(res.user);
        setCurrentView('profile');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const toggleLike = async (postId) => {
    // Optimistic Update
    const originalPosts = [...posts];
    setPosts(posts.map(p => {
      const pid = p._id || p.id;
      if (pid === postId) {
        const isCurrentlyLiked = p.likedBy?.includes(user._id || user.id);
        return {
          ...p,
          likes: isCurrentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          likedBy: isCurrentlyLiked
            ? p.likedBy.filter(id => id !== (user._id || user.id))
            : [...(p.likedBy || []), (user._id || user.id)]
        };
      }
      return p;
    }));

    try {
      await apiClient.post(`/posts/${postId}/like`, { userId: user._id || user.id });
    } catch (err) {
      console.error('Erro ao curtir:', err);
      setPosts(originalPosts); // Rollback on error
    }
  };

  const openEditModal = () => {
    setEditData({
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl || '',
      bannerUrl: user.bannerUrl || ''
    })
    setIsEditingProfile(true)
  }

  const requestDeletePost = (postId) => {
    setActiveMenuPostId(null)
    setConfirmModal({ isOpen: true, postId })
  }

  const deletePost = async () => {
    const { postId } = confirmModal
    try {
      await apiClient.delete(`/posts/${postId}`, { userId: user._id || user.id })
      setPosts(prevPosts => prevPosts.filter(p => String(p._id || p.id) !== String(postId)))
      setConfirmModal({ isOpen: false, postId: null })
      // Pequeno feedback visual opcional ou apenas fechar o modal
    } catch (err) {
      console.error('Erro ao eliminar post:', err)
      alert('Erro ao eliminar a publicação. Estás a usar a versão mais recente?')
    }
  }

  const togglePin = async (post) => {
    const postId = post._id || post.id
    const newPinStatus = !post.isPinned
    try {
      await apiClient.put(`/posts/${postId}`, { isPinned: newPinStatus })
      const updatedPosts = posts.map(p =>
        String(p._id || p.id) === String(postId) ? { ...p, isPinned: newPinStatus } : p
      ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      setPosts(updatedPosts)
      setActiveMenuPostId(null)
    } catch (err) {
      console.error('Erro ao fixar post:', err)
    }
  }

  const handleEditPost = (post) => {
    setEditingPost({ ...post })
    setActiveMenuPostId(null)
  }

  const saveEditedPost = async () => {
    if (!editingPost.content.trim()) return
    const postId = editingPost._id || editingPost.id
    try {
      await apiClient.put(`/posts/${postId}`, {
        content: editingPost.content,
        imageUrl: editingPost.imageUrl
      })
      setPosts(posts.map(p =>
        String(p._id || p.id) === String(postId)
          ? { ...p, content: editingPost.content, imageUrl: editingPost.imageUrl }
          : p
      ))
      setEditingPost(null)
    } catch (err) {
      console.error('Erro ao editar post:', err)
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, [type]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    const payload = { _id: user._id || user.id, ...editData };

    try {
      const res = await apiClient.put('/user/update', payload)

      if (res && res.success) {
        setUser(res.user)
        localStorage.setItem('tywaky_user', JSON.stringify(res.user))
        setIsEditingProfile(false)
      } else {
        alert('Erro do servidor: ' + (res?.message || 'Resposta inesperada'));
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Falha crítica na comunicação: ' + err.message);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="auth-card glass">
          <img src="/assets/logo.png" alt="Tywaky Logo" style={{ width: '220px', height: 'auto', margin: '0 auto 1.5rem', display: 'block', objectFit: 'contain' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Bem-vindo à rede do futuro.</p>

          <div className="auth-tabs">
            <button
              className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Entrar
            </button>
            <button
              className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {authMode === 'register' && (
              <>
                <div className={`input-group ${authErrors.name ? 'error' : ''}`}>
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Teu nome"
                    value={authData.name}
                    onChange={handleAuthInputChange}
                    required
                  />
                  {authErrors.name && <div className="error-message">{authErrors.name}</div>}
                </div>
                <div className={`input-group ${authErrors.handle ? 'error' : ''}`}>
                  <label>Utilizador (Handle)</label>
                  <input
                    type="text"
                    name="handle"
                    placeholder="@teu_handle"
                    value={authData.handle}
                    onChange={handleAuthInputChange}
                    required
                  />
                  {authErrors.handle && <div className="error-message">{authErrors.handle}</div>}
                </div>
              </>
            )}
            <div className={`input-group ${authErrors.email ? 'error' : ''}`}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="exemplo@email.com"
                value={authData.email}
                onChange={handleAuthInputChange}
                required
              />
              {authErrors.email && <div className="error-message">{authErrors.email}</div>}
            </div>
            <div className={`input-group ${authErrors.password ? 'error' : ''}`}>
              <label>Palavra-passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={authData.password}
                onChange={handleAuthInputChange}
                required
              />
              {authErrors.password && <div className="error-message">{authErrors.password}</div>}
            </div>
            {authMode === 'register' && (
              <div className={`input-group ${authErrors.confirmPassword ? 'error' : ''}`}>
                <label>Confirmar Palavra-passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={authData.confirmPassword}
                  onChange={handleAuthInputChange}
                  required
                />
                {authErrors.confirmPassword && <div className="error-message">{authErrors.confirmPassword}</div>}
              </div>
            )}

            {authErrors.form && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{authErrors.form}</div>}

            <button type="submit" className={`btn-primary ${isSubmitting ? 'submitting' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? 'A processar...' : (authMode === 'login' ? 'Entrar' : 'Começar Agora')}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="main-wrapper">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        handleLogout={handleLogout}
        setViewedProfile={setViewedProfile}
        unreadCount={unreadCount}
      />

      <main className="main-content">
        {currentView === 'feed' ? (
          <>
            <header className="header">
              <h3>Feed Principal</h3>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="glass"
                  style={{ padding: '0.6rem 1rem', borderRadius: '20px', border: 'none', color: 'white', width: '250px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>

            <div className="mini-profile-card glass">
              <div className="mini-banner" style={{
                backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
                height: '250px'
              }}></div>
              <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div className="avatar-mini" style={{
                    backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : '',
                    backgroundColor: 'var(--primary)'
                  }}></div>

                  {/* Bio Ticker */}
                  <div className="ticker-mini">
                    <div className="ticker-label">TYWAKY PRO</div>
                    <div className="ticker-content">
                      {user.bio} &nbsp;&bull;&nbsp; {user.bio} &nbsp;&bull;&nbsp; {user.bio}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{user.name}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.handle}</span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                  <span><strong>{user.following}</strong> <span style={{ color: 'var(--text-muted)' }}>A seguir</span></span>
                  <span><strong>{user.followers}</strong> <span style={{ color: 'var(--text-muted)' }}>Seguidores</span></span>
                </div>
              </div>
            </div>

            <PostEditor
              user={user}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              newPostImage={newPostImage}
              setNewPostImage={setNewPostImage}
              handlePostImageChange={handlePostImageChange}
              createPost={createPost}
            />

            <section className="feed">
              {isInitialLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton-post glass">
                    <div className="skeleton-header">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-line-group">
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line x-short"></div>
                      </div>
                    </div>
                    <div className="skeleton-content">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line medium"></div>
                    </div>
                  </div>
                ))
              ) : (
                posts
                  .filter(post =>
                    (post.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (post.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (post.handle?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                  )
                  .map(post => {
                    const pid = post._id || post.id;
                    return (
                      <Post
                        key={pid}
                        post={post}
                        currentUser={user}
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
                    );
                  })
              )}

              {!isInitialLoading && visiblePosts < posts.length && (
                <div className="load-more-trigger" ref={(el) => {
                  if (el) {
                    const observer = new IntersectionObserver((entries) => {
                      if (entries[0].isIntersecting && !isLoadingMore) {
                        setIsLoadingMore(true);
                        setTimeout(() => {
                          setVisiblePosts(prev => prev + 6);
                          setIsLoadingMore(false);
                        }, 800);
                      }
                    }, { threshold: 1.0 });
                    observer.observe(el);
                  }
                }}>
                  {isLoadingMore && <div className="loader-spinner"></div>}
                </div>
              )}
            </section>
          </>
        ) : currentView === 'notifications' ? (
          <NotificationsView
            notifications={notifications}
            markNotificationsAsRead={markNotificationsAsRead}
            handleViewProfile={handleViewProfile}
          />
        ) : user?.isAdmin && currentView === 'admin' ? (
          <AdminPanel currentUser={user} handleViewProfile={handleViewProfile} />
        ) : (
          <ProfileView
            user={viewedProfile || user}
            isOwnProfile={!viewedProfile || (viewedProfile._id || viewedProfile.id) === (user._id || user.id)}
            currentUser={user}
            posts={posts}
            activeMenuPostId={activeMenuPostId}
            setActiveMenuPostId={setActiveMenuPostId}
            togglePin={togglePin}
            handleEditPost={handleEditPost}
            requestDeletePost={requestDeletePost}
            toggleLike={toggleLike}
            setCommentModal={setCommentModal}
            PostComponent={Post}
            openEditModal={openEditModal}
            handleDeleteComment={handleDeleteComment}
            setCurrentView={setCurrentView}
            handleFollow={handleFollow}
            handleUnfollow={handleUnfollow}
            handleViewProfile={handleViewProfile}
          />
        )}
      </main>

      <RightSidebar
        currentUser={user}
        allUsers={allUsers}
        setCurrentView={setCurrentView}
        handleViewProfile={handleViewProfile}
        setActiveChatUser={setActiveChatUser}
        activeChatUser={activeChatUser}
      />

      <Modals
        isEditingProfile={isEditingProfile}
        setIsEditingProfile={setIsEditingProfile}
        editData={editData}
        setEditData={setEditData}
        handleFileChange={handleFileChange}
        saveProfile={saveProfile}
        editingPost={editingPost}
        setEditingPost={setEditingPost}
        saveEditedPost={saveEditedPost}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        deletePost={deletePost}
        commentModal={commentModal}
        setCommentModal={setCommentModal}
        handleAddComment={handleAddComment}
      />
    </div>
  )
}

export default App
