import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AdminPanel = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get('/admin/users');
            if (res.success) {
                setUsers(res.users);
            }
        } catch (err) {
            console.error('Erro ao buscar utilizadores:', err);
            setMessage({ type: 'error', text: 'Falha ao carregar lista de utilizadores.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Tem a certeza que deseja APAGAR COMPLETAMENTE a conta de ${userName}? Esta ação é irreversível.`)) {
            try {
                const res = await apiClient.delete(`/admin/users/${userId}`);
                if (res.success) {
                    setMessage({ type: 'success', text: `Utilizador ${userName} eliminado.` });
                    setUsers(users.filter(u => u._id !== userId));
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Erro ao eliminar utilizador.' });
            }
        }
    };

    const handleBanUser = async (userId, userName) => {
        const days = window.prompt(`Banir ${userName} por quantos dias?`, '7');
        if (days && !isNaN(days)) {
            try {
                const res = await apiClient.post('/admin/ban/user', { userId, days });
                if (res.success) {
                    setMessage({ type: 'success', text: `${userName} banido por ${days} dias.` });
                    fetchUsers();
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Erro ao banir utilizador.' });
            }
        }
    };

    const handleBanIp = async (userId, userName) => {
        if (window.confirm(`⚠️ AÇÃO DRÁSTICA: Deseja banir PERMANENTEMENTE a conta e o IP de ${userName}?`)) {
            try {
                const res = await apiClient.post('/admin/ban/ip', { userId });
                if (res.success) {
                    setMessage({ type: 'success', text: `${userName} e o seu IP foram banidos permanentemente.` });
                    fetchUsers();
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Erro ao aplicar banimento de IP.' });
            }
        }
    };

    const handleUnban = async (userId, userName) => {
        try {
            const res = await apiClient.post(`/admin/unban/${userId}`);
            if (res.success) {
                setMessage({ type: 'success', text: `${userName} foi libertado.` });
                fetchUsers();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao desbanir.' });
        }
    };

    // Identificar IPs duplicados para destaque
    const ipCounts = users.reduce((acc, user) => {
        const ip = user.registrationIp;
        if (ip) {
            acc[ip] = (acc[ip] || 0) + 1;
        }
        return acc;
    }, {});

    if (loading) return <div className="loader-spinner"></div>;

    return (
        <div className="admin-container glass" style={{ padding: '2rem', marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                🛡️ Painel Administrativo
            </h2>

            {message && (
                <div className={`alert ${message.type}`} style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                    border: `1px solid ${message.type === 'success' ? '#4ade80' : '#f87171'}`,
                    color: message.type === 'success' ? '#4ade80' : '#f87171'
                }}>
                    {message.text}
                </div>
            )}

            <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="stat-card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total utilizadores</span>
                    <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{users.length}</h3>
                </div>
                <div className="stat-card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>IPs Detetados</span>
                    <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{Object.keys(ipCounts).length}</h3>
                </div>
            </div>

            <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem' }}>Utilizador</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>IP de Registo</th>
                            <th style={{ padding: '1rem' }}>Estado</th>
                            <th style={{ padding: '1rem' }}>Ações de Moderação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isDuplicate = u.registrationIp && ipCounts[u.registrationIp] > 1;
                            const isBanned = u.isBanned;
                            return (
                                <tr key={u._id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    backgroundColor: isBanned ? 'rgba(248, 113, 113, 0.05)' : (isDuplicate ? 'rgba(251, 191, 36, 0.03)' : 'transparent')
                                }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div className="avatar-mini-circle" style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundImage: u.avatarUrl ? `url(${u.avatarUrl})` : '',
                                                backgroundColor: 'var(--primary)',
                                                backgroundSize: 'cover'
                                            }}></div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.handle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            color: isDuplicate ? '#fbbf24' : (u.registrationIp ? 'inherit' : '#64748b')
                                        }}>
                                            {u.registrationIp || 'Pré-Implementação'}
                                            {isDuplicate && (
                                                <div style={{ fontSize: '0.65rem', color: '#fbbf24', marginTop: '4px' }}>
                                                    ⚠️ IP Partilhado ({ipCounts[u.registrationIp]} contas)
                                                </div>
                                            )}
                                            {!u.registrationIp && (
                                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>
                                                    Conta anterior ao rastreio
                                                </div>
                                            )}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {isBanned ? (
                                            <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                                                🚫 BANIDO {u.banExpires ? `(Até ${new Date(u.banExpires).toLocaleDateString()})` : '(IP e Conta)'}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>✅ ATIVO</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.email !== currentUser.email ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {isBanned ? (
                                                    <button onClick={() => handleUnban(u._id, u.name)} className="btn-success-small" style={{ background: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ade80', color: '#4ade80', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Libertar</button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleBanUser(u._id, u.name)} style={{ background: 'rgba(251, 191, 36, 0.2)', border: '1px solid #fbbf24', color: '#fbbf24', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Banir Tempo</button>
                                                        <button onClick={() => handleBanIp(u._id, u.name)} style={{ background: 'rgba(248, 113, 113, 0.2)', border: '1px solid #f87171', color: '#f87171', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>BANIR IP</button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDeleteUser(u._id, u.name)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Eliminar</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Administrador</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
