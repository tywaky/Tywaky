/* eslint-env node */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');
const BannedIp = require('./models/BannedIp');
require('dotenv').config();

// Middleware para verificar se o utilizador ou IP está banido
const checkBan = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // Verificar IP na blacklist
        const isIpBanned = await BannedIp.findOne({ ip });
        if (isIpBanned) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado: Este IP foi banido permanentemente da rede Tywaky.'
            });
        }

        // Se estiver autenticado, verificar se o user está banido
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
                const user = await User.findById(decoded.id);

                if (user && user.isBanned) {
                    if (user.banExpires && new Date() > user.banExpires) {
                        // Ban expirou, libertar automaticamente
                        user.isBanned = false;
                        user.banExpires = null;
                        await user.save();
                    } else {
                        const timeLeft = user.banExpires
                            ? `Expira em: ${new Date(user.banExpires).toLocaleString()}`
                            : 'Banimento permanente.';
                        return res.status(403).json({
                            success: false,
                            message: `A tua conta está suspensa. ${timeLeft}`
                        });
                    }
                }
            } catch (err) {
                // Token inválido, ignoramos e deixamos passar (o middleware de auth tratará se necessário)
            }
        }
        next();
    } catch (err) {
        next();
    }
};

// Middleware para verificar se o utilizador é administrador
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Não autorizado' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // No futuro, podemos verificar no DB, mas por agora confiamos no token decodificado 
        // ou verificamos o email especificamente para segurança extra nesta fase
        if (decoded.isAdmin || decoded.email === 'joaosilvagfx@gmail.com') {
            req.adminUser = decoded;
            next();
        } else {
            res.status(403).json({ success: false, message: 'Acesso negado: Apenas administradores' });
        }
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// Conectar ao MongoDB
connectDB();

const SALT_ROUNDS = 10;

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(checkBan); // Aplicar verificação de banimento em todos os requests

// Helper para ler/escrever dados (Legado - Mantido apenas para referência durante migração se necessário)
// const readData = async () => ...
// const writeData = async (data) => ...

// Rotas API
app.get('/api/health', (req, res) => res.json({ status: 'ok', online: true }));

app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth & User
// Auth & User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            const { password: _, ...userWithoutPassword } = user.toObject();
            const token = jwt.sign(
                { id: user._id, email: user.email, isAdmin: user.isAdmin },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            )
            res.json({ success: true, user: { ...userWithoutPassword, isAdmin: user.isAdmin }, token })
        } else {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no servidor' })
    }
})

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, handle, name, password } = req.body;

        // Verificar se já existe
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ success: false, message: 'Email já registado' });

        const existingHandle = await User.findOne({ handle });
        if (existingHandle) return res.status(400).json({ success: false, message: 'Handle já está em uso' });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Capturar IP (considerando proxies como Render/Vercel)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Verificar se o IP está banido antes de permitir registo
        const isIpBanned = await BannedIp.findOne({ ip });
        if (isIpBanned) {
            return res.status(403).json({
                success: false,
                message: 'Registo negado: Este IP foi banido permanentemente da rede Tywaky.'
            });
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            handle,
            registrationIp: ip,
            isAdmin: email === 'joaosilvagfx@gmail.com', // Primeira conta admin automática
            followers: 0,
            following: 0,
            bio: "Olá, estou no Tywaky!",
            avatarUrl: ""
        });

        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        )

        res.status(201).json({ success: true, user: { ...userWithoutPassword, isAdmin: newUser.isAdmin }, token });
    } catch (error) {
        console.error('Erro no registo:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar conta' });
    }
});

// Administrativo
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao listar utilizadores' });
    }
});

// Banir conta e recalcular estatísticas
app.post('/api/admin/ban/account', isAdmin, async (req, res) => {
    try {
        const { userId, days } = req.body;
        let update = { isBanned: true };

        if (days && !isNaN(days)) {
            const expires = new Date();
            expires.setDate(expires.getDate() + parseInt(days));
            update.banExpires = expires;
        } else {
            update.banExpires = null; // Permanente
        }

        const user = await User.findByIdAndUpdate(userId, update, { new: true });

        // Sincronizar stats ao banir (opcional, mas bom para consistência)
        if (user) {
            user.following = (user.followingIds || []).length;
            await user.save();
        }

        res.json({ success: true, message: 'Conta suspensa com sucesso.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao banir conta' });
    }
});

// Endpoint global de correção de dados (ADMIN ONLY)
app.post('/api/admin/system/fix-stats', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        const results = [];

        for (const user of users) {
            // 1. Unificar e limpar IDs de seguimento
            const originalIds = user.followingIds || [];
            const uniqueIds = [...new Set(originalIds)];

            // 2. Verificar se os IDs seguidos ainda existem
            const validIds = [];
            for (const followId of uniqueIds) {
                const exists = await User.findById(followId);
                if (exists) validIds.push(followId);
            }

            user.followingIds = validIds;
            user.following = validIds.length;

            // 3. Recalcular seguidores (quem segue este user)
            const followersCount = await User.countDocuments({ followingIds: user._id.toString() });
            user.followers = followersCount;

            await user.save();
            results.push({ handle: user.handle, following: user.following, followers: user.followers });
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Liberar CONTA
app.post('/api/admin/unban/account', isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        await User.findByIdAndUpdate(userId, { isBanned: false, banExpires: null });
        res.json({ success: true, message: 'Conta reativada com sucesso.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao liberar conta' });
    }
});

// Banir IP
app.post('/api/admin/ban/ip', isAdmin, async (req, res) => {
    try {
        const { ip, userId } = req.body;
        let targetIp = ip;

        // Se passarem userId, buscar o IP dele
        if (!targetIp && userId) {
            const user = await User.findById(userId);
            targetIp = user?.registrationIp;
        }

        if (!targetIp) return res.status(400).json({ success: false, message: 'IP não identificado' });

        await BannedIp.findOneAndUpdate(
            { ip: targetIp },
            { ip: targetIp, bannedBy: req.adminUser.id },
            { upsert: true }
        );

        res.json({ success: true, message: `IP ${targetIp} banido com sucesso.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao banir IP' });
    }
});

// Liberar IP
app.post('/api/admin/unban/ip', isAdmin, async (req, res) => {
    try {
        const { ip, userId } = req.body;
        let targetIp = ip;

        if (!targetIp && userId) {
            const user = await User.findById(userId);
            targetIp = user?.registrationIp;
        }

        if (!targetIp) return res.status(400).json({ success: false, message: 'IP não identificado' });

        await BannedIp.deleteOne({ ip: targetIp });
        res.json({ success: true, message: `IP ${targetIp} libertado com sucesso.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao liberar IP' });
    }
});

app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Não permitir que o admin se apague a si próprio por engano
        if (id === req.adminUser.id) {
            return res.status(400).json({ success: false, message: 'Não pode apagar a sua própria conta de administrador' });
        }

        await User.findByIdAndDelete(id);
        await Post.deleteMany({ userId: id });
        res.json({ success: true, message: 'Utilizador e as suas publicações eliminados com sucesso' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao eliminar utilizador' });
    }
});

app.put('/api/user/update', async (req, res) => {
    const { _id, id, ...updateFields } = req.body;
    const targetId = _id || id;

    try {
        // Find user first to ensure we have the correct state
        const user = await User.findById(targetId);
        if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });

        // Update fields
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] !== undefined) {
                user[key] = updateFields[key];
            }
        });

        // Recalculate stats based on actual array lengths to fix ghost follows
        if (user.followingIds) {
            user.following = user.followingIds.length;
        }

        await user.save();

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Erro ao atualizar utilizador:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/user/handle/:handle', async (req, res) => {
    const { handle } = req.params;
    try {
        const user = await User.findOne({ handle }, '-password');
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Follow/Unfollow logic
app.post('/api/user/:id/follow', async (req, res) => {
    const { id: targetId } = req.params;
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (user && target) {
            if (!user.followingIds.includes(String(targetId))) {
                user.followingIds.push(String(targetId));
                user.following += 1;
                target.followers += 1;
                await user.save();
                await target.save();
            }
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/user/:id/unfollow', async (req, res) => {
    const { id: targetId } = req.params;
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (user && target) {
            if (user.followingIds && user.followingIds.includes(String(targetId))) {
                user.followingIds = user.followingIds.filter(id => id !== String(targetId));
                user.following = Math.max(0, user.following - 1);
                target.followers = Math.max(0, target.followers - 1);
                await user.save();
                await target.save();
            }
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ isPinned: -1, createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        // Garantir que o userId está presente (vem do frontend ou token)
        const postData = req.body;
        if (!postData.userId) return res.status(400).json({ success: false, message: 'ID de utilizador em falta' });

        const post = new Post({ ...postData, comments: [] });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Erro ao Criar Post:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Like/Unlike Toggle
app.post('/api/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ success: false, message: 'Post não encontrado' });

        const likedIndex = post.likedBy.indexOf(String(userId));
        if (likedIndex === -1) {
            post.likedBy.push(String(userId));
            post.likes += 1;
        } else {
            post.likedBy.splice(likedIndex, 1);
            post.likes = Math.max(0, post.likes - 1);
        }

        await post.save();
        res.json({ success: true, likes: post.likes, liked: likedIndex === -1 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Atualizar Post (Editar ou Fixar)
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { content, isPinned, imageUrl, userId } = req.body;
    try {
        const post = await Post.findById(id);

        if (post) {
            // Se enviar userId, verificar permissão (opcional, mas bom)
            if (userId && String(post.userId) !== String(userId)) {
                return res.status(403).json({ success: false, message: 'Não tens permissão' });
            }

            if (content !== undefined) post.content = content;
            if (isPinned !== undefined) post.isPinned = isPinned;
            if (imageUrl !== undefined) post.imageUrl = imageUrl;
            await post.save();
            res.json({ success: true, post });
        } else {
            res.status(404).json({ success: false, message: 'Post não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    // O delete pode receber userId no body (como o App.jsx envia)
    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post não encontrado' });
        }

        // Deletar sem restrição de userId por agora para garantir que funciona, 
        // ou verificar contra o que vem no token se quisermos ser rigorosos.
        await Post.findByIdAndDelete(id);
        res.json({ success: true, message: 'Post removido com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Comentários
app.post('/api/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    const commentData = req.body;
    try {
        const post = await Post.findById(id);
        if (post) {
            post.comments.push(commentData);
            await post.save();
            res.json({ success: true, comment: commentData });
        } else {
            res.status(404).json({ success: false, message: 'Post não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/posts/:id/comments/:commentId', async (req, res) => {
    const { id, commentId } = req.params;
    try {
        const post = await Post.findById(id);
        if (post) {
            const initialLength = post.comments.length;
            post.comments = post.comments.filter(c => String(c._id || c.id) !== String(commentId));

            if (post.comments.length < initialLength) {
                await post.save();
                res.json({ success: true, message: 'Comentário removido' });
            } else {
                res.status(404).json({ success: false, message: 'Comentário não encontrado' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Post não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// O frontend será servido pela Vercel separadamente

app.listen(PORT, () => {
    console.log(`🚀 Tywaky Backend a correr na porta ${PORT}`);
});
