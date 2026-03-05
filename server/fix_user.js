const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const fixUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Restaurando identidade do utilizador...');

        const result = await User.updateOne(
            { email: 'joaosilvagfx@gmail.com' },
            {
                $set: {
                    name: 'Joao Silva',
                    handle: '@Joao_Silva', // Garantir que o handle está correto
                    isAdmin: true          // Garantir que continua como admin
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log('✅ Utilizador joaosilvagfx@gmail.com restaurado para "Joao Silva"!');
        } else {
            console.log('❌ Utilizador não encontrado.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Erro:', err);
    }
};

fixUser();
