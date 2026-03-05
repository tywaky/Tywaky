import fs from 'fs-extra';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'server', 'data.json');
const SALT_ROUNDS = 10;

async function migrate() {
    try {
        const data = await fs.readJson(DATA_FILE);
        console.log('Starting migration...');

        for (let user of data.users) {
            // Check if password is already a bcrypt hash (starts with $2a$ or $2b$)
            if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                console.log(`Hashing password for user: ${user.email}`);
                user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
            } else {
                console.log(`Password already hashed for user: ${user.email}`);
            }
        }

        await fs.writeJson(DATA_FILE, data, { spaces: 2 });
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
