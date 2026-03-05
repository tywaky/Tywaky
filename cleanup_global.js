
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config({ path: './server/.env' });

async function cleanupDb() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- CLEANUP START ---');

    const users = await User.find({});

    for (const user of users) {
        console.log(`Checking user: ${user.handle}`);

        // 1. Remove duplicates from followingIds
        const uniqueFollowing = [...new Set(user.followingIds || [])];

        // 2. Remove non-existent user IDs from followingIds
        const validFollowing = [];
        for (const id of uniqueFollowing) {
            if (id && mongoose.Types.ObjectId.isValid(id)) {
                const exists = await User.findById(id);
                if (exists) {
                    validFollowing.push(id);
                } else {
                    console.log(`Removing ghost follow for user ${user.handle}: ${id}`);
                }
            }
        }

        user.followingIds = validFollowing;
        user.following = validFollowing.length;

        // 3. Recalculate followers count
        const followers = await User.countDocuments({ followingIds: user._id.toString() });
        user.followers = followers;

        await user.save();
        console.log(`Fixed user: ${user.handle} | Following: ${user.following} | Followers: ${user.followers}`);
    }

    console.log('--- CLEANUP FINISHED ---');
    mongoose.connection.close();
}

cleanupDb();
