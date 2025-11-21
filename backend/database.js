const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./chat.db", (err) => {
    if (err) console.error(err);
    else console.log("SQLite connecté");
});

db.serialize(() => {
    // Table Users
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            bio TEXT,
            avatar TEXT,
            avatar_color TEXT DEFAULT '#5865F2',
            status TEXT DEFAULT 'online',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (!err) {
            // Add profile columns if they don't exist
            db.run("ALTER TABLE users ADD COLUMN bio TEXT", () => {});
            db.run("ALTER TABLE users ADD COLUMN avatar TEXT", () => {});
            db.run("ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT '#5865F2'", () => {});
            db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'online'", () => {});
            db.run("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", () => {});
        }
    });

    // Table Channels
    db.run(`
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            description TEXT,
            icon TEXT DEFAULT '💬'
        )
    `, (err) => {
        if (!err) {
            db.run("ALTER TABLE channels ADD COLUMN icon TEXT DEFAULT '💬'", () => { });
        }
    });

    // Table Messages (Updated with channel_id)
    // Note: If table exists without channel_id, this might fail or need migration.
    // For simplicity in this context, we'll try to add the column if it doesn't exist or recreate.
    // Since we can't easily check columns in one go without complexity, we'll assume fresh start or compatible.
    // Ideally, we would check if column exists.
    // Let's try to create it with the new schema. If it exists, we might need to ALTER.

    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            message TEXT,
            channel_id INTEGER,
            recipient_id INTEGER,
            reply_to_id INTEGER,
            sender_id INTEGER,
            file_path TEXT,
            file_name TEXT,
            file_type TEXT,
            file_size INTEGER,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(channel_id) REFERENCES channels(id),
            FOREIGN KEY(recipient_id) REFERENCES users(id),
            FOREIGN KEY(reply_to_id) REFERENCES messages(id),
            FOREIGN KEY(sender_id) REFERENCES users(id)
        )
    `, (err) => {
        if (!err) {
            // Try to add columns if they were missing
            db.run("ALTER TABLE messages ADD COLUMN channel_id INTEGER DEFAULT 1", () => { });
            db.run("ALTER TABLE messages ADD COLUMN recipient_id INTEGER", () => { });
            db.run("ALTER TABLE messages ADD COLUMN reply_to_id INTEGER", () => { });
            db.run("ALTER TABLE messages ADD COLUMN sender_id INTEGER", () => { });
            db.run("ALTER TABLE messages ADD COLUMN file_path TEXT", () => { });
            db.run("ALTER TABLE messages ADD COLUMN file_name TEXT", () => { });
            db.run("ALTER TABLE messages ADD COLUMN file_type TEXT", () => { });
            db.run("ALTER TABLE messages ADD COLUMN file_size INTEGER", () => { });
        }
    });

    // Table Reactions
    db.run(`
        CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER,
            user_id INTEGER,
            emoji TEXT,
            FOREIGN KEY(message_id) REFERENCES messages(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // Seed Channels
    const channels = [
        { name: "Général", description: "Discussion générale" }
    ];

    const stmt = db.prepare("INSERT OR IGNORE INTO channels (name, description) VALUES (?, ?)");
    channels.forEach(ch => {
        stmt.run(ch.name, ch.description);
    });
    stmt.finalize();
});

module.exports = db;