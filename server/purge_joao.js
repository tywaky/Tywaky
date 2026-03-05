
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function purgeJoaoGhost() {
    await mongoose.connect(process.env.MONGODB_URI);
    const joao = await User.findOne({ handle: '@Joao_Silva' });
    if (joao) {
        console.log(`BEFORE: ${joao.followingIds.length} IDs`);

        const validIds = [];
        for (const id of joao.followingIds) {
            const exists = await User.findById(id);
            if (exists) {
                validIds.push(id);
            } else {
                console.log(`PURGING Ghost ID: ${id}`);
            }
        }

        joao.followingIds = validIds;
        joao.following = validIds.length;
        await joao.save();
        console.log(`AFTER: ${joao.followingIds.length} IDs | Following Count: ${joao.following}`);
    }
    mongoose.connection.close();
}

purgeJoaoGhost();
