const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cors = require("cors");
app.use(cors());
app.use(express.json());

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const db = require("./database");
const SECRET_KEY = "super_secret_key_change_me"; // In production use env var

// --- AUTHENTICATION ---

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Champs manquants" });

    const hash = bcrypt.hashSync(password, 10);

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "Pseudo déjà pris" });
            return res.status(500).json({ error: "Erreur serveur" });
        }
        const token = jwt.sign({ id: this.lastID, username }, SECRET_KEY);
        res.json({ token, username, id: this.lastID });
    });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Utilisateur inconnu" });

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
            res.json({ token, username: user.username, id: user.id });
        } else {
            res.status(401).json({ error: "Mot de passe incorrect" });
        }
    });
});

app.get("/api/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token manquant" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        res.json({ id: user.id, username: user.username, token });
    });
});

// --- CHANNELS ---

app.get("/api/channels", (req, res) => {
    db.all("SELECT * FROM channels", (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur DB" });
        res.json(rows);
    });
});

// --- USERS ---

app.get("/api/users", (req, res) => {
    db.all("SELECT id, username FROM users", (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur DB" });
        res.json(rows);
    });
});

// --- SOCKET.IO ---

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a personal room for DMs based on user ID (we need the user ID from handshake or login event)
    // For simplicity, we'll rely on the client sending a "login" event or just joining manually
    socket.on("user_login", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined personal room`);
    });

    socket.on("delete_channel", (channelId) => {
        // Prevent deleting the default channel (assuming ID 1 is General)
        if (channelId == 1) return;

        db.run("DELETE FROM channels WHERE id = ?", [channelId], function (err) {
            if (!err) {
                // Delete associated messages and reactions
                // First get message IDs to delete reactions
                db.all("SELECT id FROM messages WHERE channel_id = ?", [channelId], (err, rows) => {
                    if (!err && rows.length > 0) {
                        const messageIds = rows.map(r => r.id).join(',');
                        db.run(`DELETE FROM reactions WHERE message_id IN (${messageIds})`);
                    }
                    db.run("DELETE FROM messages WHERE channel_id = ?", [channelId]);
                });

                io.emit("channel_deleted", channelId);
            }
        });
    });

    socket.on("create_channel", (data) => {
        // data can be string (old way) or object { name, icon }
        let name = data;
        let icon = "💬";

        if (typeof data === 'object') {
            name = data.name;
            icon = data.icon || "💬";
        }

        if (!name) return;

        db.run("INSERT INTO channels (name, description, icon) VALUES (?, ?, ?)", [name, "Channel utilisateur", icon], function (err) {
            if (!err) {
                const newChannel = { id: this.lastID, name: name, description: "Channel utilisateur", icon: icon };
                io.emit("channel_created", newChannel);
            }
        });
    });

    socket.on("join_channel", (channelId) => {
        socket.join(`channel_${channelId}`);

        // Send history for this channel with reactions and reply info
        const query = `
            SELECT m.*, 
            (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
             FROM reactions r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.message_id = m.id) as reactions,
            rm.username as reply_username,
            rm.message as reply_message
            FROM messages m 
            LEFT JOIN messages rm ON m.reply_to_id = rm.id
            WHERE m.channel_id = ? 
            ORDER BY m.date DESC LIMIT 50
        `;

        db.all(query, [channelId], (err, rows) => {
            if (!err) {
                // Parse JSON reactions
                const messages = rows.map(row => ({
                    ...row,
                    reactions: row.reactions ? JSON.parse(row.reactions) : []
                }));
                socket.emit("message_history", messages.reverse());
            } else {
                console.error(err);
            }
        });
    });

    socket.on("join_dm", (data) => {
        const { myId, otherId } = data;
        const query = `
            SELECT m.*, 
            (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
             FROM reactions r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.message_id = m.id) as reactions,
            rm.username as reply_username,
            rm.message as reply_message
            FROM messages m 
            LEFT JOIN messages rm ON m.reply_to_id = rm.id
            WHERE (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
               OR (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
            ORDER BY m.date DESC LIMIT 50
        `;

        db.all(query, [myId, otherId, otherId, myId], (err, rows) => {
            if (!err) {
                const messages = rows.map(row => ({
                    ...row,
                    reactions: row.reactions ? JSON.parse(row.reactions) : []
                }));
                socket.emit("message_history", messages.reverse());
            }
        });
    });

    socket.on("add_reaction", (data) => {
        const { message_id, emoji, user_id, channel_id, recipient_id } = data;

        // Check if reaction already exists
        db.get("SELECT * FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?", [message_id, user_id, emoji], (err, row) => {
            if (row) {
                // Reaction exists, remove it (toggle off)
                db.run("DELETE FROM reactions WHERE id = ?", [row.id], (err) => {
                    if (!err) {
                        const reactionData = {
                            message_id,
                            emoji,
                            user_id,
                            action: "remove"
                        };
                        broadcastReaction(reactionData, channel_id, recipient_id, user_id);
                    }
                });
            } else {
                // Reaction doesn't exist, add it (toggle on)
                db.run("INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)", [message_id, user_id, emoji], function (err) {
                    if (!err) {
                        // Get username for the reaction
                        db.get("SELECT username FROM users WHERE id = ?", [user_id], (err, user) => {
                            const reactionData = {
                                message_id,
                                emoji,
                                user_id,
                                username: user ? user.username : "Unknown",
                                action: "add"
                            };
                            broadcastReaction(reactionData, channel_id, recipient_id, user_id);
                        });
                    }
                });
            }
        });
    });

    function broadcastReaction(data, channel_id, recipient_id, sender_id) {
        if (channel_id) {
            io.to(`channel_${channel_id}`).emit("reaction_update", data);
        } else if (recipient_id) {
            io.to(`user_${recipient_id}`).emit("reaction_update", data);
            io.to(`user_${sender_id}`).emit("reaction_update", data);
        }
    }

    socket.on("leave_channel", (channelId) => {
        socket.leave(`channel_${channelId}`);
    });

    // --- CONVERSATIONS ---

    app.get("/api/conversations/:userId", (req, res) => {
        const userId = req.params.userId;
        const query = `
        SELECT DISTINCT u.id, u.username 
        FROM users u
        JOIN messages m ON (m.sender_id = u.id AND m.recipient_id = ?) 
                        OR (m.recipient_id = u.id AND m.sender_id = ?)
    `;
        db.all(query, [userId, userId], (err, rows) => {
            if (err) return res.status(500).json({ error: "Erreur DB" });
            res.json(rows);
        });
    });

    socket.on("send_message", (data) => {
        const { username, message, channel_id, recipient_id, sender_id, reply_to_id } = data;

        // Helper to get reply info if it exists
        const getReplyInfo = (callback) => {
            if (!reply_to_id) return callback(null, null);
            db.get("SELECT username, message FROM messages WHERE id = ?", [reply_to_id], (err, row) => {
                callback(err, row);
            });
        };

        getReplyInfo((err, replyRow) => {
            const reply_username = replyRow ? replyRow.username : null;
            const reply_message = replyRow ? replyRow.message : null;

            if (recipient_id) {
                // Private Message
                db.run(
                    "INSERT INTO messages (username, message, recipient_id, sender_id, reply_to_id) VALUES (?, ?, ?, ?, ?)",
                    [username, message, recipient_id, sender_id, reply_to_id],
                    function (err) {
                        if (!err) {
                            const savedMessage = {
                                id: this.lastID,
                                username,
                                message,
                                recipient_id,
                                sender_id,
                                reply_to_id,
                                reply_username,
                                reply_message,
                                date: new Date().toISOString()
                            };
                            io.to(`user_${recipient_id}`).emit("receive_message", savedMessage);
                            io.to(`user_${sender_id}`).emit("receive_message", savedMessage);

                            // Notify for new conversation
                            io.to(`user_${recipient_id}`).emit("new_conversation", { id: sender_id, username: username });
                            io.to(`user_${sender_id}`).emit("new_conversation", { id: recipient_id, username: "User" }); // Ideally we fetch recipient username
                        }
                    }
                );
            } else {
                // Channel Message
                db.run(
                    "INSERT INTO messages (username, message, channel_id, sender_id, reply_to_id) VALUES (?, ?, ?, ?, ?)",
                    [username || "Anonyme", message, channel_id, sender_id, reply_to_id],
                    function (err) {
                        if (!err) {
                            const savedMessage = {
                                id: this.lastID,
                                username: username || "Anonyme",
                                message,
                                channel_id,
                                sender_id,
                                reply_to_id,
                                reply_username,
                                reply_message,
                                date: new Date().toISOString()
                            };
                            io.to(`channel_${channel_id}`).emit("receive_message", savedMessage);
                        }
                    }
                );
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});