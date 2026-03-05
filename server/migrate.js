/* eslint-env node */
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const DATA_FILE = path.join(__dirname, 'data.json');

const migrate = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tywaky';
        console.log(`📡 Conectado ao MongoDB: ${mongoUri.split('@').pop()}...`);
        await mongoose.connect(mongoUri);

        if (!await fs.pathExists(DATA_FILE)) {
            console.log('❌ Arquivo data.json não encontrado.');
            process.exit(1);
        }

        const data = await fs.readJson(DATA_FILE);

        // Limpar coleções existentes
        await User.deleteMany({});
        await Post.deleteMany({});

        console.log(`🧹 Coleções limpas. Iniciando migração de ${data.users.length} usuários e ${data.posts.length} posts...`);

        // Migrar Usuários
        // Guardar mapeamento de ID para referência
        const userMap = {};
        for (const u of data.users) {
            const newUser = new User({
                ...u,
            });
            await newUser.save();
            userMap[u.id] = u;
            userMap[u.name] = u.id; // Para busca por nome exato

            // Mapeamentos extras para nomes comuns ou parciais encontrados na data
            if (u.name === 'Joao Paulo Silva') userMap['Joao Silva'] = u.id;
        }
        console.log('✅ Usuários migrados.');

        // Migrar Posts
        let migratedPosts = 0;
        for (const p of data.posts) {
            let userId = p.userId;

            // Tentar recuperar userId se estiver faltando
            if (!userId && p.user) {
                userId = userMap[p.user];
                console.log(`ℹ️ UserId recuperado para post de "${p.user}": ${userId}`);
            }

            if (!userId) {
                console.warn(`⚠️ Pulando post ${p.id} porque não tem userId válido.`);
                continue;
            }

            // Encontrar infos do autor para denormalização (opcional, mas o sistema atual parece usar)
            const author = data.users.find(u => u.id === userId || u.id == userId);

            const newPost = new Post({
                ...p,
                userId: String(userId),
                user: p.user || (author ? author.name : 'Usuário Desconhecido'),
                handle: p.handle || (author ? author.handle : ''),
                avatar: p.avatarUrl || (author ? author.avatarUrl : ''),
                time: p.timestamp || p.time || 'Agora'
            });

            await newPost.save();
            migratedPosts++;
        }
        console.log(`✅ ${migratedPosts} posts migrados.`);

        console.log('🎉 Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
};

migrate();
