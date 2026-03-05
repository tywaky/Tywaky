const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const setAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Conectado ao MongoDB para promover admin...');

        const result = await User.updateOne(
            { email: 'joaosilvagfx@gmail.com' },
            { $set: { isAdmin: true } }
        );

        if (result.matchedCount > 0) {
            console.log('✅ Utilizador joaosilvagfx@gmail.com promovido a Admin!');
        } else {
            console.log('❌ Utilizador não encontrado. Verifica o email.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Erro:', err);
    }
};

setAdmin();
