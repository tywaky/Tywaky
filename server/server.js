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
require('dotenv').config();

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

// Helper para ler/escrever dados (Legado - Mantido apenas para referência durante migração se necessário)
// const readData = async () => ...
// const writeData = async (data) => ...

// Rotas API
app.get('/api/health', (req, res) => res.json({ status: 'ok', online: true }));

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
    const updatedData = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { id: updatedData.id }, // Using legacy ID for now to match frontend if not converted
            { $set: updatedData },
            { new: true }
        );

        if (user) {
            const { password: _, ...userWithoutPassword } = user.toObject();
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
        }
    } catch (error) {
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
        const user = await User.findOne({ id: userId });
        const target = await User.findOne({ id: targetId });

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
        const user = await User.findOne({ id: userId });
        const target = await User.findOne({ id: targetId });

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
        const post = new Post({ ...req.body, comments: [] });
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { content, isPinned, imageUrl, userId } = req.body;
    try {
        const post = await Post.findOne({ id }); // Using legacy id for now

        if (post) {
            if (String(post.userId) !== String(userId)) {
                return res.status(403).json({ success: false, message: 'Não tens permissão para editar esta publicação' });
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
    const { userId } = req.body;
    try {
        const post = await Post.findOne({ id });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post não encontrado' });
        }

        if (String(post.userId) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Não tens permissão para eliminar esta publicação' });
        }

        await Post.deleteOne({ id });
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
        const post = await Post.findOne({ id });
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
        const post = await Post.findOne({ id });
        if (post) {
            const initialLength = post.comments.length;
            post.comments = post.comments.filter(c => String(c.id) !== String(commentId));

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
