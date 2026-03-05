
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/models/User');

async function debugSession() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tywaky');
    const users = await User.find({});
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
        console.log(`Name: ${u.name}, Handle: ${u.handle}, ID: ${u._id}`);
        console.log(`Following: ${u.following}, FollowingIds: ${JSON.stringify(u.followingIds)}`);
        console.log(`Avatar Present: ${!!u.avatarUrl}, Banner Present: ${!!u.bannerUrl}`);
        console.log('---------------------------');
    });
    mongoose.connection.close();
}

debugSession();
