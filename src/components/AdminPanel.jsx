import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AdminPanel = ({ currentUser, handleViewProfile }) => {
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
            } catch (error) {
                console.error('Erro ao eliminar:', error);
                setMessage({ type: 'error', text: 'Erro ao eliminar utilizador.' });
            }
        }
    };

    const handleBanAccount = async (userId, userName) => {
        const days = window.prompt(`Banir CONTA de ${userName} por quantos dias? (Deixe em branco para permanente)`, '');
        try {
            const res = await apiClient.post('/admin/ban/account', { userId, days: days || null });
            if (res.success) {
                setMessage({ type: 'success', text: `Conta de ${userName} suspensa.` });
                fetchUsers();
            }
        } catch (error) {
            console.error('Erro ao banir:', error);
            setMessage({ type: 'error', text: 'Erro ao banir conta.' });
        }
    };

    const handleUnbanAccount = async (userId, userName) => {
        try {
            const res = await apiClient.post('/admin/unban/account', { userId });
            if (res.success) {
                setMessage({ type: 'success', text: `Conta de ${userName} reativada.` });
                fetchUsers();
            }
        } catch (error) {
            console.error('Erro ao desbanir:', error);
            setMessage({ type: 'error', text: 'Erro ao liberar conta.' });
        }
    };

    const handleBanIp = async (userId, userName, ip) => {
        if (!ip || ip === 'Pré-Implementação') {
            alert('Não é possível banir este IP (Não identificado).');
            return;
        }
        if (window.confirm(`Bloquear todo o acesso do IP: ${ip}?`)) {
            try {
                const res = await apiClient.post('/admin/ban/ip', { userId });
                if (res.success) {
                    setMessage({ type: 'success', text: `IP ${ip} foi colocado na lista negra.` });
                    fetchUsers();
                }
            } catch (error) {
                console.error('Erro ao banir IP:', error);
                setMessage({ type: 'error', text: 'Erro ao banir IP.' });
            }
        }
    };

    const handleUnbanIp = async (userId, userName) => {
        try {
            const res = await apiClient.post('/admin/unban/ip', { userId });
            if (res.success) {
                setMessage({ type: 'success', text: `IP de ${userName} foi libertado.` });
                fetchUsers();
            }
        } catch (error) {
            console.error('Erro ao desbanir IP:', error);
            setMessage({ type: 'error', text: 'Erro ao libertar IP.' });
        }
    };

    // Identificar IPs duplicados
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
                🛡️ Moderação Avançada Tywaky
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

            <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem' }}>Utilizador</th>
                            <th style={{ padding: '1rem' }}>Informação Crítica</th>
                            <th style={{ padding: '1rem' }}>Estado da Conta</th>
                            <th style={{ padding: '1rem' }}>Moderação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isDuplicate = u.registrationIp && ipCounts[u.registrationIp] > 1;
                            const isAccountBanned = u.isBanned;

                            return (
                                <tr key={u._id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    backgroundColor: isAccountBanned ? 'rgba(248, 113, 113, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
                                            onClick={() => handleViewProfile(u.handle)}
                                            title={`Ver perfil de ${u.name}`}
                                        >
                                            <div className="avatar-mini-circle" style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                backgroundImage: u.avatarUrl ? `url(${u.avatarUrl})` : 'linear-gradient(45deg, var(--primary), var(--accent))',
                                                backgroundColor: 'var(--primary)', backgroundSize: 'cover'
                                            }}></div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.handle}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                            <span style={{ color: isDuplicate ? '#fbbf24' : 'inherit' }}>
                                                {u.registrationIp || 'IP: Oculto/Antigo'}
                                            </span>
                                            {isDuplicate && (
                                                <div style={{ fontSize: '0.65rem', color: '#fbbf24' }}>
                                                    ⚠️ {ipCounts[u.registrationIp]} contas ligadas
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {isAccountBanned ? (
                                            <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                                                🚫 SUSPENSA {u.banExpires ? `(Até ${new Date(u.banExpires).toLocaleDateString()})` : '(PERMANENTE)'}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>✅ ATIVA</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.email !== currentUser.email ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {/* Botões de Conta */}
                                                {isAccountBanned ? (
                                                    <button onClick={() => handleUnbanAccount(u._id, u.name)} style={{ background: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ade80', color: '#4ade80', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🔓 Liberar Conta</button>
                                                ) : (
                                                    <button onClick={() => handleBanAccount(u._id, u.name)} style={{ background: 'rgba(251, 191, 36, 0.2)', border: '1px solid #fbbf24', color: '#fbbf24', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🚫 Banir Conta</button>
                                                )}

                                                {/* Botões de IP */}
                                                <button onClick={() => handleBanIp(u._id, u.name, u.registrationIp)} style={{ background: 'rgba(248, 113, 113, 0.2)', border: '1px solid #f87171', color: '#f87171', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🌐 Banir IP</button>
                                                <button onClick={() => handleUnbanIp(u._id, u.name, u.registrationIp)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--text-white)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🔓 Liberar IP</button>

                                                <button onClick={() => handleDeleteUser(u._id, u.name)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🗑️ Apagar</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>CRIADOR (IMUNE)</span>
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
