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
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tywaky');
        console.log('📡 Conectado ao MongoDB para migração...');

        if (!await fs.pathExists(DATA_FILE)) {
            console.log('❌ Arquivo data.json não encontrado.');
            process.exit(1);
        }

        const data = await fs.readJson(DATA_FILE);

        // Limpar coleções existentes (opcional, mas recomendado para migração limpa se for a primeira vez)
        await User.deleteMany({});
        await Post.deleteMany({});

        console.log(`🧹 Coleções limpas. Iniciando migração de ${data.users.length} usuários e ${data.posts.length} posts...`);

        // Migrar Usuários
        const userPromises = data.users.map(u => {
            // Mapping legacy fields if any, though they seem to match mostly
            return new User(u).save();
        });
        await Promise.all(userPromises);
        console.log('✅ Usuários migrados.');

        // Migrar Posts
        const postPromises = data.posts.map(p => {
            return new Post(p).save();
        });
        await Promise.all(postPromises);
        console.log('✅ Posts migrados.');

        console.log('🎉 Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
};

migrate();
