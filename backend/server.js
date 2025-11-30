// Load environment variables
require('dotenv').config();

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cors = require("cors");
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Instant Chat API is running. Please visit http://localhost:3000 for the frontend.");
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Allowed file types with MIME types and extensions mapping
const ALLOWED_TYPES = {
    // Audio
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/mp4": [".m4a"],
    // Video
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "video/ogg": [".ogv"],
    "video/quicktime": [".mov"],
    // Documents
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    "text/plain": [".txt"],
    "text/csv": [".csv"],
    // Images
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"]
};

// Allowed extensions (for double validation)
const ALLOWED_EXTENSIONS = new Set();
Object.values(ALLOWED_TYPES).forEach(exts => {
    exts.forEach(ext => ALLOWED_EXTENSIONS.add(ext.toLowerCase()));
});

// Dangerous extensions to block
const DANGEROUS_EXTENSIONS = new Set([
    ".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar",
    ".sh", ".ps1", ".dll", ".msi", ".app", ".deb", ".rpm", ".dmg",
    ".php", ".asp", ".aspx", ".jsp", ".py", ".rb", ".pl", ".cgi"
]);

// File filter with security checks
const fileFilter = (req, file, cb) => {
    // Get file extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    // Block dangerous extensions
    if (DANGEROUS_EXTENSIONS.has(fileExt)) {
        return cb(new Error("Type de fichier dangereux non autorisé"), false);
    }
    
    // Check if extension is allowed
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
        return cb(new Error("Extension de fichier non autorisée"), false);
    }
    
    // Check if MIME type is allowed
    if (!ALLOWED_TYPES[file.mimetype]) {
        return cb(new Error("Type MIME non autorisé"), false);
    }
    
    // Verify MIME type matches extension
    const allowedExts = ALLOWED_TYPES[file.mimetype];
    if (!allowedExts.includes(fileExt)) {
        return cb(new Error("Le type MIME ne correspond pas à l'extension du fichier"), false);
    }
    
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (sanitizedName !== file.originalname) {
        file.originalname = sanitizedName;
    }
    
    cb(null, true);
};

// Max file size: 50MB (50 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10 // Maximum 10 files per request
    }
});

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// REMOVED: mediasoup-client - now using WebRTC native

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
    },
    // Configuration pour la production (reverse proxy)
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

const db = require("./database");
const SECRET_KEY = process.env.JWT_SECRET || "super_secret_key_change_me";
// REMOVED: voiceServer (mediasoup) - now using WebRTC native

// --- AUTHENTICATION MIDDLEWARE ---

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide" });
        }
        req.user = decoded;
        next();
    });
}

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
        // Generate JWT token with expiration (7 days)
        const token = jwt.sign(
            { id: this.lastID, username },
            SECRET_KEY,
            { expiresIn: '7d' }
        );
        res.json({ token, username, id: this.lastID });
    });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Utilisateur inconnu" });

        if (bcrypt.compareSync(password, user.password)) {
            // Generate JWT token with expiration (7 days)
            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET_KEY,
                { expiresIn: '7d' }
            );
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
        
        // Get full user profile
        db.get("SELECT id, username, bio, avatar, avatar_color, status, created_at FROM users WHERE id = ?", [user.id], (err, userData) => {
            if (err) return res.status(500).json({ error: "Erreur DB" });
            res.json({ ...userData, token });
        });
    });
});

// Get user profile by ID
app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    
    // Get requesting user ID if authenticated (optional)
    const authHeader = req.headers.authorization;
    let requestingUserId = null;
    
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            requestingUserId = decoded.id;
        } catch (err) {
            // Token invalid, continue without user context
        }
    }
    
    db.get("SELECT id, username, bio, avatar, avatar_color, status, created_at FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: "Erreur DB" });
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
        
        // For invisible users, show as offline to others (except themselves)
        if (user.status === 'invisible' && user.id !== requestingUserId) {
            user.status = 'offline';
        }
        
        res.json(user);
    });
});

// Update user profile
app.put("/api/users/:id/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token manquant" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        
        const userId = req.params.id;
        if (decoded.id !== parseInt(userId)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        const { bio, avatar, avatar_color, status } = req.body;
        const updates = [];
        const values = [];

        if (bio !== undefined) {
            updates.push("bio = ?");
            values.push(bio);
        }
        if (avatar !== undefined) {
            updates.push("avatar = ?");
            values.push(avatar);
        }
        if (avatar_color !== undefined) {
            updates.push("avatar_color = ?");
            values.push(avatar_color);
        }
        if (status !== undefined) {
            // Validate status
            let normalizedStatus = status;
            if (status === 'away') {
                normalizedStatus = 'idle';
            }
            const validStatuses = ['online', 'idle', 'away', 'dnd', 'invisible', 'offline'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}` });
            }
            updates.push("status = ?");
            values.push(normalizedStatus);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
        
        db.run(query, values, function(err) {
            if (err) return res.status(500).json({ error: "Erreur DB" });
            
            // Return updated user
            db.get("SELECT id, username, bio, avatar, avatar_color, status, created_at FROM users WHERE id = ?", [userId], (err, user) => {
                if (err) return res.status(500).json({ error: "Erreur DB" });

                // Broadcast user update to everyone
                io.emit("user_updated", user);

                res.json(user);
            });
        });
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
    // Get requesting user ID if authenticated (optional)
    const authHeader = req.headers.authorization;
    let requestingUserId = null;
    
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            requestingUserId = decoded.id;
        } catch (err) {
            // Token invalid, continue without user context
        }
    }
    
    db.all("SELECT id, username, bio, avatar, avatar_color, status FROM users", (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur DB" });
        
        // For invisible users, show as offline to others (except themselves)
        const processedRows = rows.map(user => {
            if (user.status === 'invisible' && user.id !== requestingUserId) {
                return { ...user, status: 'offline' };
            }
            return user;
        });
        
        res.json(processedRows);
    });
});

// --- FILE UPLOAD ---

// Upload file endpoint with security checks
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    // Additional security checks
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Double-check extension
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
        // Delete uploaded file if it passed through somehow
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Extension de fichier non autorisée" });
    }
    
    // Verify file size (double check)
    if (req.file.size > MAX_FILE_SIZE) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Fichier trop volumineux" });
    }
    
    // Sanitize original filename for storage
    const sanitizedName = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 255); // Limit filename length

    const fileInfo = {
        path: `/uploads/${req.file.filename}`,
        originalName: sanitizedName,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
    };

    res.json(fileInfo);
});

// --- USER STATUS ---

// Update user status
app.post("/api/user/status", authenticateToken, (req, res) => {
    const { status } = req.body;
    const userId = req.user.id;
    
    // Valid statuses: online, idle (or away for compatibility), dnd, invisible, offline
    // Normalize 'away' to 'idle' for consistency
    let normalizedStatus = status;
    if (status === 'away') {
        normalizedStatus = 'idle';
    }
    
    const validStatuses = ['online', 'idle', 'away', 'dnd', 'invisible', 'offline'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}` });
    }
    
    // Use normalized status for storage
    db.run("UPDATE users SET status = ? WHERE id = ?", [normalizedStatus, userId], function(err) {
        if (err) {
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        // Broadcast status update with normalized status
        // For invisible users, broadcast as offline to others
        const broadcastStatus = normalizedStatus === 'invisible' ? 'offline' : normalizedStatus;
        io.emit("user_status_updated", { userId, status: broadcastStatus });
        
        res.json({ status: normalizedStatus, success: true });
    });
});

// --- PINNED MESSAGES ---

// Pin a message
app.post("/api/messages/pin", authenticateToken, (req, res) => {
    const { messageId } = req.body;
    const userId = req.user.id;
    
    // Check if user has permission (sender or channel admin)
    db.get("SELECT * FROM messages WHERE id = ?", [messageId], (err, message) => {
        if (err || !message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        
        // Check if user is sender or has admin rights (simplified: sender can pin)
        if (message.sender_id !== userId) {
            return res.status(403).json({ error: "Permission refusée" });
        }
        
        db.run("UPDATE messages SET pinned = 1 WHERE id = ?", [messageId], function(err) {
            if (err) {
                return res.status(500).json({ error: "Erreur serveur" });
            }
            
            // Broadcast pin update
            if (message.channel_id) {
                io.to(`channel_${message.channel_id}`).emit("message_pinned", { messageId, pinned: true });
            } else if (message.recipient_id) {
                io.to(`user_${message.recipient_id}`).emit("message_pinned", { messageId, pinned: true });
            }
            
            res.json({ success: true });
        });
    });
});

// Unpin a message
app.post("/api/messages/unpin", authenticateToken, (req, res) => {
    const { messageId } = req.body;
    const userId = req.user.id;
    
    db.get("SELECT * FROM messages WHERE id = ?", [messageId], (err, message) => {
        if (err || !message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        
        if (message.sender_id !== userId) {
            return res.status(403).json({ error: "Permission refusée" });
        }
        
        db.run("UPDATE messages SET pinned = 0 WHERE id = ?", [messageId], function(err) {
            if (err) {
                return res.status(500).json({ error: "Erreur serveur" });
            }
            
            // Broadcast unpin update
            if (message.channel_id) {
                io.to(`channel_${message.channel_id}`).emit("message_pinned", { messageId, pinned: false });
            } else if (message.recipient_id) {
                io.to(`user_${message.recipient_id}`).emit("message_pinned", { messageId, pinned: false });
            }
            
            res.json({ success: true });
        });
    });
});

// Get file info
app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Fichier introuvable" });
    }

    const stats = fs.statSync(filePath);
    res.json({
        filename: filename,
        size: stats.size,
        created: stats.birthtime
    });
});

// Get channel members (users who have sent messages in the channel)
app.get("/api/channels/:channelId/members", (req, res) => {
    const channelId = req.params.channelId;
    
    // Get requesting user ID if authenticated (optional)
    const authHeader = req.headers.authorization;
    let requestingUserId = null;
    
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            requestingUserId = decoded.id;
        } catch (err) {
            // Token invalid, continue without user context
        }
    }
    
    const query = `
        SELECT DISTINCT u.id, u.username, u.bio, u.avatar, u.avatar_color, u.status
        FROM users u
        INNER JOIN messages m ON m.sender_id = u.id
        WHERE m.channel_id = ?
        ORDER BY u.username ASC
    `;
    db.all(query, [channelId], (err, rows) => {
        if (err) {
            console.error("Erreur récupération membres channel:", err);
            return res.status(500).json({ error: "Erreur DB" });
        }
        
        // For invisible users, show as offline to others (except themselves)
        const processedRows = rows.map(user => {
            if (user.status === 'invisible' && user.id !== requestingUserId) {
                return { ...user, status: 'offline' };
            }
            return user;
        });
        
        res.json(processedRows);
    });
});

// --- SOCKET.IO ---

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    // --- VOICE CHANNEL HANDLERS (WebRTC Native - Simplified) ---
    
    // REMOVED: All mediasoup-related socket events:
    // - getRouterRtpCapabilities
    // - createTransport
    // - connectTransport
    // - produce
    // - createConsumers
    // - closeProducer
    // WebRTC native handles these directly between peers
    
    // Join voice room (WebRTC Native - simplified)
    socket.on("joinVoiceRoom", async (data) => {
        try {
            const { roomId, userId } = data;
            socket.join(`voice_${roomId}`);
            
            // Get current participants from Socket.IO rooms
            const roomSockets = await io.in(`voice_${roomId}`).fetchSockets();
            const participants = roomSockets
                .map(s => s.userId)
                .filter(id => id && id !== userId); // Exclude current user
            
            // Extract channel ID from roomId (format: "channel_15")
            const channelId = roomId.replace('channel_', '');
            
            socket.emit("voiceRoomJoined", { 
                roomId, 
                participants: participants.map(id => ({ userId: id })),
                channelId: parseInt(channelId)
            });
            
            // Notify others that this user joined
            socket.to(`voice_${roomId}`).emit("userJoinedVoice", { 
                userId,
                channelId: parseInt(channelId)
            });
            
            console.log(`User ${userId} joined voice room ${roomId}`);
        } catch (error) {
            console.error("Error joining voice room:", error);
        }
    });
    
    // Leave voice room (WebRTC Native - simplified)
    socket.on("leaveVoiceRoom", async (data) => {
        try {
            const { roomId, userId } = data;
            
            // Extract channel ID from roomId (format: "channel_15")
            const channelId = roomId.replace('channel_', '');
            
            socket.leave(`voice_${roomId}`);
            socket.to(`voice_${roomId}`).emit("userLeftVoice", { 
                userId,
                channelId: parseInt(channelId)
            });
            
            console.log(`User ${userId} left voice room ${roomId}`);
        } catch (error) {
            console.error("Error leaving voice room:", error);
        }
    });
    
    // Handle voice mute status (WebRTC Native)
    socket.on("voice_mute_status", (data) => {
        const { roomId, userId, muted } = data;
        socket.to(`voice_${roomId}`).emit("voice_mute_status", { userId, muted });
    });
    
    // Handle voice WebRTC signaling
    socket.on("voice_offer", (data) => {
        const { targetUserId, offer, roomId } = data;
        socket.to(`voice_${roomId}`).emit("voice_offer", {
            userId: socket.userId,
            targetUserId,
            offer
        });
    });

    socket.on("voice_answer", (data) => {
        const { targetUserId, answer, roomId } = data;
        socket.to(`voice_${roomId}`).emit("voice_answer", {
            userId: socket.userId,
            targetUserId,
            answer
        });
    });

    socket.on("voice_ice_candidate", (data) => {
        const { targetUserId, candidate, roomId } = data;
        socket.to(`voice_${roomId}`).emit("voice_ice_candidate", {
            userId: socket.userId,
            targetUserId,
            candidate
        });
    });

    // Handle screen share start
    socket.on("screen_share_start", (data) => {
        const { roomId, userId, channelId } = data;
        socket.to(`voice_${roomId}`).emit("screen_share_start", { 
            userId, 
            channelId: parseInt(channelId) 
        });
        console.log(`User ${userId} started screen sharing in channel ${channelId}`);
    });
    
    // Handle screen share stop
    socket.on("screen_share_stop", (data) => {
        const { roomId, userId, channelId } = data;
        socket.to(`voice_${roomId}`).emit("screen_share_stop", { 
            userId, 
            channelId: parseInt(channelId) 
        });
        console.log(`User ${userId} stopped screen sharing in channel ${channelId}`);
    });
    
    // Handle screen share WebRTC signaling
    socket.on("screen_share_offer", (data) => {
        const { targetUserId, offer, roomId } = data;
        socket.to(`voice_${roomId}`).emit("screen_share_offer", {
            userId: socket.userId,
            targetUserId,
            offer
        });
    });
    
    socket.on("screen_share_answer", (data) => {
        const { targetUserId, answer, roomId } = data;
        socket.to(`voice_${roomId}`).emit("screen_share_answer", {
            userId: socket.userId,
            targetUserId,
            answer
        });
    });
    
    socket.on("screen_share_ice_candidate", (data) => {
        const { targetUserId, candidate, roomId } = data;
        socket.to(`voice_${roomId}`).emit("screen_share_ice_candidate", {
            userId: socket.userId,
            targetUserId,
            candidate
        });
    });
    
    // Handle voice deafen status (WebRTC Native)
    socket.on("voice_deafen_status", (data) => {
        const { roomId, userId, deafened } = data;
        socket.to(`voice_${roomId}`).emit("voice_deafen_status", { userId, deafened });
    });
    
    // Handle voice speaking indicator (WebRTC Native)
    socket.on("voice_speaking", (data) => {
        const { roomId, userId } = data;
        socket.to(`voice_${roomId}`).emit("voice_speaking", { userId });
    });

    // Handle voice video status (WebRTC Native)
    socket.on("voice_video_status", (data) => {
        const { roomId, userId, enabled } = data;
        socket.to(`voice_${roomId}`).emit("voice_video_status", { userId, enabled });
    });
    
    // Handle user status updates
    socket.on("user_status_update", (data) => {
        const { userId, status } = data;
        
        // Normalize 'away' to 'idle'
        let normalizedStatus = status;
        if (status === 'away') {
            normalizedStatus = 'idle';
        }
        
        db.run("UPDATE users SET status = ? WHERE id = ?", [normalizedStatus, userId], (err) => {
            if (!err) {
                // For invisible users, broadcast as offline to others
                const broadcastStatus = normalizedStatus === 'invisible' ? 'offline' : normalizedStatus;
                io.emit("user_status_updated", { userId, status: broadcastStatus });
            }
        });
    });
    
    // Get pinned messages
    socket.on("get_pinned_messages", (data) => {
        let query, params;
        
        if (data.channelId) {
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                WHERE m.channel_id = ? AND m.pinned = 1 AND m.deleted = 0
                ORDER BY m.date DESC
            `;
            params = [data.channelId];
        } else if (data.recipientId) {
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                WHERE ((m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
                   OR (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)))
                   AND m.pinned = 1 AND m.deleted = 0
                ORDER BY m.date DESC
            `;
            params = [data.myId, data.recipientId, data.recipientId, data.myId];
        } else {
            socket.emit("pinned_messages", []);
            return;
        }
        
        db.all(query, params, (err, rows) => {
            if (!err) {
                const messages = rows.map(row => ({
                    ...row,
                    reactions: row.reactions ? JSON.parse(row.reactions) : [],
                    files: row.files_json ? JSON.parse(row.files_json) : (row.file_path ? [{
                        file_path: row.file_path,
                        file_name: row.file_name,
                        file_type: row.file_type,
                        file_size: row.file_size
                    }] : null),
                    pinned: row.pinned === 1
                }));
                socket.emit("pinned_messages", messages);
            } else {
                socket.emit("pinned_messages", []);
            }
        });
    });

    // Join a personal room for DMs based on user ID (we need the user ID from handshake or login event)
    // For simplicity, we'll rely on the client sending a "login" event or just joining manually
    socket.on("user_login", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined personal room`);
        
        // Set user status to online on login (unless they have invisible or offline set manually)
        db.get("SELECT status FROM users WHERE id = ?", [userId], (err, user) => {
            if (!err && user) {
                // Only auto-set to online if current status is offline
                // If user has invisible or offline set, keep it
                if (user.status === 'offline' || !user.status) {
                    db.run("UPDATE users SET status = ? WHERE id = ?", ['online', userId], (err) => {
                        if (!err) {
                            io.emit("user_status_updated", { userId, status: 'online' });
                        }
                    });
                }
            }
        });
        
        // Store userId in socket for disconnect handling
        socket.userId = userId;
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
        // data can be string (old way) or object { name, icon, voice_channel }
        let name = data;
        let icon = "💬";
        let voiceChannel = 0;

        if (typeof data === 'object') {
            name = data.name;
            icon = data.icon || (data.voice_channel ? "🔊" : "💬");
            voiceChannel = data.voice_channel ? 1 : 0;
        }

        if (!name) return;

        db.run("INSERT INTO channels (name, description, icon, voice_channel) VALUES (?, ?, ?, ?)", 
            [name, "Channel utilisateur", icon, voiceChannel], function (err) {
            if (!err) {
                const newChannel = { 
                    id: this.lastID, 
                    name: name, 
                    description: "Channel utilisateur", 
                    icon: icon,
                    voice_channel: voiceChannel
                };
                io.emit("channel_created", newChannel);
            }
        });
    });

    // Helper function to load channel messages
    function loadChannelMessages(socket, channelId, beforeMessageId, limit, isInitial) {
        let query, params;
        
        if (beforeMessageId) {
            // Load messages before a specific message ID
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.avatar as sender_avatar,
                u_sender.avatar_color as sender_avatar_color,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions,
                rm.username as reply_username,
                rm.message as reply_message
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                LEFT JOIN messages rm ON m.reply_to_id = rm.id
                WHERE m.channel_id = ? AND m.id < ?
                ORDER BY m.date DESC 
                LIMIT ?
            `;
            params = [channelId, beforeMessageId, limit];
        } else {
            // Load latest messages (default 25)
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.avatar as sender_avatar,
                u_sender.avatar_color as sender_avatar_color,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions,
                rm.username as reply_username,
                rm.message as reply_message
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                LEFT JOIN messages rm ON m.reply_to_id = rm.id
                WHERE m.channel_id = ? 
                ORDER BY m.date DESC 
                LIMIT ?
            `;
            params = [channelId, limit || 25];
        }

        db.all(query, params, (err, rows) => {
            if (!err) {
                const messages = rows.map(row => ({
                    ...row,
                    avatar: row.sender_avatar,
                    avatar_color: row.sender_avatar_color,
                    bio: row.sender_bio,
                    created_at: row.sender_created_at,
                    reactions: row.reactions ? JSON.parse(row.reactions) : [],
                    files: row.files_json ? JSON.parse(row.files_json) : (row.file_path ? [{
                        file_path: row.file_path,
                        file_name: row.file_name,
                        file_type: row.file_type,
                        file_size: row.file_size
                    }] : null),
                    edited: row.edited === 1,
                    deleted: row.deleted === 1,
                    edited_at: row.edited_at
                }));
                
                if (isInitial) {
                    socket.emit("message_history", messages.reverse());
                } else {
                    socket.emit("more_messages", messages.reverse());
                }
            } else {
                console.error(err);
                if (!isInitial) {
                    socket.emit("more_messages", []);
                }
            }
        });
    }

    socket.on("join_channel", (channelId) => {
        socket.join(`channel_${channelId}`);
        // Load first 50 messages
        loadChannelMessages(socket, channelId, null, 50, true);
    });

    // Load more messages for channel (pagination)
    socket.on("load_more_messages", (data) => {
        const { channelId, recipientId, beforeMessageId, limit = 50 } = data;
        
        if (channelId) {
            loadChannelMessages(socket, channelId, beforeMessageId, limit, false);
        } else if (recipientId) {
            loadDMMessages(socket, data.myId, recipientId, beforeMessageId, limit, false);
        }
    });

    socket.on("join_dm", (data) => {
        const { myId, otherId } = data;
        // Load first 50 messages
        loadDMMessages(socket, myId, otherId, null, 50, true);
    });

    // Helper function to load DM messages
    function loadDMMessages(socket, myId, otherId, beforeMessageId, limit, isInitial) {
        let query, params;
        
        if (beforeMessageId) {
            // Load messages before a specific message ID
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.avatar as sender_avatar,
                u_sender.avatar_color as sender_avatar_color,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions,
                rm.username as reply_username,
                rm.message as reply_message
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                LEFT JOIN messages rm ON m.reply_to_id = rm.id
                WHERE ((m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
                   OR (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)))
                   AND m.id < ?
                ORDER BY m.date DESC 
                LIMIT ?
            `;
            params = [myId, otherId, otherId, myId, beforeMessageId, limit];
        } else {
            // Load latest messages
            query = `
                SELECT m.*, 
                u_sender.status as sender_status,
                u_sender.avatar as sender_avatar,
                u_sender.avatar_color as sender_avatar_color,
                u_sender.bio as sender_bio,
                u_sender.created_at as sender_created_at,
                (SELECT json_group_array(json_object('emoji', r.emoji, 'user_id', r.user_id, 'username', u.username)) 
                 FROM reactions r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.message_id = m.id) as reactions,
                rm.username as reply_username,
                rm.message as reply_message
                FROM messages m 
                LEFT JOIN users u_sender ON m.sender_id = u_sender.id
                LEFT JOIN messages rm ON m.reply_to_id = rm.id
                WHERE (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
                   OR (m.recipient_id = ? AND m.username = (SELECT username FROM users WHERE id = ?)) 
                ORDER BY m.date DESC 
                LIMIT ?
            `;
            params = [myId, otherId, otherId, myId, limit || 25];
        }

        db.all(query, params, (err, rows) => {
            if (!err) {
                const messages = rows.map(row => ({
                    ...row,
                    avatar: row.sender_avatar,
                    avatar_color: row.sender_avatar_color,
                    bio: row.sender_bio,
                    created_at: row.sender_created_at,
                    reactions: row.reactions ? JSON.parse(row.reactions) : [],
                    files: row.files_json ? JSON.parse(row.files_json) : (row.file_path ? [{
                        file_path: row.file_path,
                        file_name: row.file_name,
                        file_type: row.file_type,
                        file_size: row.file_size
                    }] : null),
                    edited: row.edited === 1,
                    deleted: row.deleted === 1,
                    edited_at: row.edited_at
                }));
                
                if (isInitial) {
                    socket.emit("message_history", messages.reverse());
                } else {
                    socket.emit("more_messages", messages.reverse());
                }
            } else {
                if (!isInitial) {
                    socket.emit("more_messages", []);
                }
            }
        });
    }

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

    // Edit message
    socket.on("edit_message", (data) => {
        const { message_id, new_message, user_id, channel_id, recipient_id } = data;
        
        // Verify user owns the message
        db.get("SELECT sender_id FROM messages WHERE id = ?", [message_id], (err, row) => {
            if (err || !row) {
                return socket.emit("edit_message_error", { error: "Message introuvable" });
            }
            
            if (row.sender_id !== user_id) {
                return socket.emit("edit_message_error", { error: "Vous ne pouvez modifier que vos propres messages" });
            }
            
            // Update message
            db.run(
                "UPDATE messages SET message = ?, edited = 1, edited_at = CURRENT_TIMESTAMP WHERE id = ?",
                [new_message, message_id],
                function (err) {
                    if (err) {
                        return socket.emit("edit_message_error", { error: "Erreur lors de la modification" });
                    }
                    
                    // Get updated message
                    db.get("SELECT * FROM messages WHERE id = ?", [message_id], (err, updatedMsg) => {
                        if (!err && updatedMsg) {
                            const messageData = {
                                id: updatedMsg.id,
                                message: updatedMsg.message,
                                edited: true,
                                edited_at: updatedMsg.edited_at
                            };
                            
                            // Broadcast to channel or DM
                            if (channel_id) {
                                io.to(`channel_${channel_id}`).emit("message_edited", messageData);
                            } else if (recipient_id) {
                                io.to(`user_${recipient_id}`).emit("message_edited", messageData);
                                io.to(`user_${user_id}`).emit("message_edited", messageData);
                            }
                        }
                    });
                }
            );
        });
    });

    // Delete message
    socket.on("delete_message", (data) => {
        const { message_id, user_id, channel_id, recipient_id } = data;
        
        // Verify user owns the message
        db.get("SELECT sender_id FROM messages WHERE id = ?", [message_id], (err, row) => {
            if (err || !row) {
                return socket.emit("delete_message_error", { error: "Message introuvable" });
            }
            
            if (row.sender_id !== user_id) {
                return socket.emit("delete_message_error", { error: "Vous ne pouvez supprimer que vos propres messages" });
            }
            
            // Soft delete (mark as deleted instead of actually deleting)
            db.run(
                "UPDATE messages SET deleted = 1, message = '[Message supprimé]' WHERE id = ?",
                [message_id],
                function (err) {
                    if (err) {
                        return socket.emit("delete_message_error", { error: "Erreur lors de la suppression" });
                    }
                    
                    const messageData = {
                        id: message_id,
                        deleted: true
                    };
                    
                    // Broadcast to channel or DM
                    if (channel_id) {
                        io.to(`channel_${channel_id}`).emit("message_deleted", messageData);
                    } else if (recipient_id) {
                        io.to(`user_${recipient_id}`).emit("message_deleted", messageData);
                        io.to(`user_${user_id}`).emit("message_deleted", messageData);
                    }
                }
            );
        });
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
        const { username, message, channel_id, recipient_id, sender_id, reply_to_id, file_path, file_name, file_type, file_size, files } = data;
        
        // Handle multiple files: if files array is provided, use it; otherwise fall back to single file
        let files_json = null;
        if (files && Array.isArray(files) && files.length > 0) {
            files_json = JSON.stringify(files);
        } else if (file_path) {
            // Single file: convert to array format for consistency
            files_json = JSON.stringify([{
                file_path,
                file_name,
                file_type,
                file_size
            }]);
        }

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

            // Get sender status and avatar data to send immediately
            db.get("SELECT status, avatar, avatar_color, bio, created_at FROM users WHERE id = ?", [sender_id], (err, sender) => {
                const sender_status = sender ? sender.status : 'online';
                const sender_avatar = sender ? sender.avatar : null;
                const sender_avatar_color = sender ? sender.avatar_color : null;
                const sender_bio = sender ? sender.bio : null;
                const sender_created_at = sender ? sender.created_at : null;

                if (recipient_id) {
                    // Private Message
                    db.run(
                        "INSERT INTO messages (username, message, recipient_id, sender_id, reply_to_id, file_path, file_name, file_type, file_size, files_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [username, message, recipient_id, sender_id, reply_to_id, file_path || null, file_name || null, file_type || null, file_size || null, files_json],
                        function (err) {
                            if (!err) {
                                const savedMessage = {
                                    id: this.lastID,
                                    username,
                                    message,
                                    recipient_id,
                                    sender_id,
                                    sender_status: sender_status === 'invisible' ? 'offline' : sender_status,
                                    avatar: sender_avatar,
                                    avatar_color: sender_avatar_color,
                                    bio: sender_bio,
                                    created_at: sender_created_at,
                                    reply_to_id,
                                    reply_username,
                                    reply_message,
                                    file_path: file_path || null,
                                    file_name: file_name || null,
                                    file_type: file_type || null,
                                    file_size: file_size || null,
                                    files_json: files_json,
                                    files: files_json ? JSON.parse(files_json) : (file_path ? [{
                                        file_path,
                                        file_name,
                                        file_type,
                                        file_size
                                    }] : null),
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
                        "INSERT INTO messages (username, message, channel_id, sender_id, reply_to_id, file_path, file_name, file_type, file_size, files_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [username || "Anonyme", message, channel_id, sender_id, reply_to_id, file_path || null, file_name || null, file_type || null, file_size || null, files_json],
                        function (err) {
                            if (!err) {
                                const savedMessage = {
                                    id: this.lastID,
                                    username: username || "Anonyme",
                                    message,
                                    channel_id,
                                    sender_id,
                                    sender_status: sender_status === 'invisible' ? 'offline' : sender_status,
                                    avatar: sender_avatar,
                                    avatar_color: sender_avatar_color,
                                    bio: sender_bio,
                                    created_at: sender_created_at,
                                    reply_to_id,
                                    reply_username,
                                    reply_message,
                                    file_path: file_path || null,
                                    file_name: file_name || null,
                                    file_type: file_type || null,
                                    file_size: file_size || null,
                                    files_json: files_json,
                                    files: files_json ? JSON.parse(files_json) : (file_path ? [{
                                        file_path,
                                        file_name,
                                        file_type,
                                        file_size
                                    }] : null),
                                    edited: false,
                                    deleted: false,
                                    date: new Date().toISOString()
                                };
                                io.to(`channel_${channel_id}`).emit("receive_message", savedMessage);
                            }
                        }
                    );
                }
            });
        });
    });

    // Typing indicator events
    socket.on("typing", (data) => {
        const { username, user_id, channel_id, recipient_id } = data;
        
        if (channel_id) {
            // Broadcast to channel (except sender)
            socket.to(`channel_${channel_id}`).emit("user_typing", {
                username,
                user_id,
                channel_id
            });
        } else if (recipient_id) {
            // Send to specific recipient
            io.to(`user_${recipient_id}`).emit("user_typing", {
                username,
                user_id,
                recipient_id
            });
        }
    });
    
    socket.on("stop_typing", (data) => {
        const { username, user_id, channel_id, recipient_id } = data;
        
        if (channel_id) {
            // Broadcast to channel (except sender)
            socket.to(`channel_${channel_id}`).emit("user_stopped_typing", {
                username,
                user_id,
                channel_id
            });
        } else if (recipient_id) {
            // Send to specific recipient
            io.to(`user_${recipient_id}`).emit("user_stopped_typing", {
                username,
                user_id,
                recipient_id
            });
        }
    });

    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        
        // Update user status to offline on disconnect
        if (socket.userId) {
            db.get("SELECT status FROM users WHERE id = ?", [socket.userId], (err, user) => {
                if (!err && user) {
                    // Only set to offline if not already invisible (invisible users stay invisible)
                    if (user.status !== 'invisible') {
                        db.run("UPDATE users SET status = ? WHERE id = ?", ['offline', socket.userId], (err) => {
                            if (!err) {
                                io.emit("user_status_updated", { userId: socket.userId, status: 'offline' });
                            }
                        });
                    }
                }
            });
        }
        
        // Clean up voice connections on disconnect
        // This will be handled by the leaveVoiceRoom event
    });
});

// Start server (WebRTC Native - no mediasoup initialization needed)
const PORT = 3001; // Force port 3001 to avoid conflict with Next.js
const NODE_ENV = process.env.NODE_ENV || 'development';

// Listen on 0.0.0.0 to accept connections from outside (important for VPS)
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log("Voice channels using WebRTC native");
    if (NODE_ENV === 'production') {
        console.log(`Socket.IO available at: http://${HOST}:${PORT}/socket.io/`);
    }
});
