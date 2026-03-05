
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function auditJoao() {
    await mongoose.connect(process.env.MONGODB_URI);
    const joao = await User.findOne({ handle: '@Joao_Silva' });
    if (joao) {
        console.log(`Joao FOLLOWING COUNT: ${joao.following}`);
        console.log(`Joao FOLLOWING IDS: ${JSON.stringify(joao.followingIds)}`);

        // Check who those IDs are
        for (const id of joao.followingIds) {
            const u = await User.findById(id);
            console.log(`- Following ID ${id}: ${u ? u.handle : 'ACCOUNT DELETED/GHOST'}`);
        }
    } else {
        console.log('Joao not found!');
    }
    mongoose.connection.close();
}

auditJoao();
