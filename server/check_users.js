const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Analisando utilizadores na base de dados...');

        const users = await User.find({}, 'name email handle isAdmin registrationIp');
        console.log(JSON.stringify(users, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Erro:', err);
    }
};

checkUsers();
