/* eslint-env node */
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const cleanup = async () => {
    try {
        await connectDB();

        console.log('🧹 A iniciar limpeza da base de dados...');

        // Remover todos os posts
        const postResult = await Post.deleteMany({});
        console.log(`✅ ${postResult.deletedCount} publicações removidas.`);

        // Remover todos os utilizadores
        const userResult = await User.deleteMany({});
        console.log(`✅ ${userResult.deletedCount} utilizadores removidos.`);

        console.log('✨ Base de dados limpa com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Erro durante a limpeza: ${error.message}`);
        process.exit(1);
    }
};

cleanup();
