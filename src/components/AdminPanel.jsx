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
                    border: `1px solid ${message.type === 'success' ? '#4ade80' : '#f87171'}`
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
                            <th style={{ padding: '1rem' }}>Data</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isDuplicate = u.registrationIp && ipCounts[u.registrationIp] > 1;
                            return (
                                <tr key={u._id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    backgroundColor: isDuplicate ? 'rgba(251, 191, 36, 0.03)' : 'transparent'
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
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.email !== currentUser.email ? (
                                            <button
                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                className="btn-danger-small"
                                                style={{
                                                    background: 'rgba(248, 113, 113, 0.2)',
                                                    border: '1px solid #f87171',
                                                    color: '#f87171',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Admin (Tu)</span>
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
