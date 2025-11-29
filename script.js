const socket = io("http://localhost:3000");

// Configuration
const API_BASE_URL = "http://localhost:3000";

// Icon helper functions (shadcn/ui style - Lucide icons)
const Icons = {
    // Create SVG icon element
    create: (path, size = 20, className = "") => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        if (className) svg.classList.add(className);
        
        if (Array.isArray(path)) {
            path.forEach(p => {
                const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathEl.setAttribute("d", p);
                svg.appendChild(pathEl);
            });
        } else {
            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", path);
            svg.appendChild(pathEl);
        }
        
        return svg;
    },
    
    // Icon definitions (Lucide paths)
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
    edit2: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    
    trash: "M3 6h18",
    trash2: "M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16",
    
    reply: "M9 10l-5 5 5 5",
    reply2: "M9 15l5-5-5-5",
    
    plus: "M12 5v14",
    plus2: "M5 12h14",
    
    x: "M18 6L6 18",
    x2: "M6 6l12 12",
    
    send: "M22 2L11 13",
    send2: "M22 2l-7 20-4-9-9-4z",
    
    smile: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10",
    smile2: "M8 14s1.5 2 4 2 4-2 4-2",
    smile3: "M9 9h.01",
    smile4: "M15 9h.01",
    
    paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
    
    moreVertical: "M12 12h.01",
    moreVertical2: "M12 19h.01",
    moreVertical3: "M12 5h.01",
    
    hash: "M4 9h16",
    hash2: "M4 15h16",
    hash3: "M10 3v6",
    hash4: "M14 3v6",
    hash5: "M10 21v-6",
    hash6: "M14 21v-6",
    
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
    user2: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    
    logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    logOut2: "M16 17l5-5-5-5",
    logOut3: "M21 12H9",
    
    menu: "M3 12h18",
    menu2: "M3 6h18",
    menu3: "M3 18h18",
    
    settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    settings2: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    
    messageSquare: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    
    // Helper to get icon by name
    get: (name, size = 20, className = "") => {
        const iconMap = {
            edit: () => Icons.create([Icons.edit, Icons.edit2], size, className),
            trash: () => Icons.create([Icons.trash, Icons.trash2], size, className),
            reply: () => Icons.create([Icons.reply, Icons.reply2], size, className),
            plus: () => Icons.create([Icons.plus, Icons.plus2], size, className),
            x: () => Icons.create([Icons.x, Icons.x2], size, className),
            send: () => Icons.create([Icons.send, Icons.send2], size, className),
            smile: () => Icons.create([Icons.smile, Icons.smile2, Icons.smile3, Icons.smile4], size, className),
            paperclip: () => Icons.create(Icons.paperclip, size, className),
            moreVertical: () => Icons.create([Icons.moreVertical, Icons.moreVertical2, Icons.moreVertical3], size, className),
            hash: () => Icons.create([Icons.hash, Icons.hash2, Icons.hash3, Icons.hash4, Icons.hash5, Icons.hash6], size, className),
            user: () => Icons.create([Icons.user, Icons.user2], size, className),
            logOut: () => Icons.create([Icons.logOut, Icons.logOut2, Icons.logOut3], size, className),
            menu: () => Icons.create([Icons.menu, Icons.menu2, Icons.menu3], size, className),
            settings: () => Icons.create([Icons.settings, Icons.settings2], size, className),
            messageSquare: () => Icons.create(Icons.messageSquare, size, className)
        };
        
        return iconMap[name] ? iconMap[name]() : null;
    }
};

// State
let currentUser = null;
let currentChannel = null;
let currentRecipient = null; // For DMs
let channels = [];
let users = [];

// DOM Elements
const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const chatView = document.getElementById("chat-view");

const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");
const btnGoToRegister = document.getElementById("btn-go-to-register");

const registerUsernameInput = document.getElementById("register-username");
const registerPasswordInput = document.getElementById("register-password");
const registerPasswordConfirmInput = document.getElementById("register-password-confirm");
const btnRegister = document.getElementById("btn-register");
const btnGoToLogin = document.getElementById("btn-go-to-login");

const channelsList = document.getElementById("channels-list");
const usersList = document.getElementById("users-list");
const channelMembersList = document.getElementById("channel-members-list");
const channelMembersHeader = document.getElementById("channel-members-header");
const channelMembersCount = document.getElementById("channel-members-count");
const userAvatar = document.getElementById("user-avatar");
const userAvatarContainer = document.getElementById("user-profile-avatar-container");
const userStatusIndicator = document.getElementById("user-status-indicator");
const currentUsernameDisplay = document.getElementById("current-username");
const btnLogout = document.getElementById("btn-logout");
const btnUserProfile = document.getElementById("btn-user-profile");

// Profile Modal Elements
const profileModal = document.getElementById("profile-modal");
const closeProfileModal = document.getElementById("close-profile-modal");
const profileUsername = document.getElementById("profile-username");
const profileBio = document.getElementById("profile-bio");
const profileStatus = document.getElementById("profile-status");
const profileAvatarDisplay = document.getElementById("profile-avatar-display");
const profileStatusDisplay = document.getElementById("profile-status-display");
const saveProfileBtn = document.getElementById("save-profile");
const cancelProfileEdit = document.getElementById("cancel-profile-edit");
const editAvatarBtn = document.getElementById("edit-avatar-btn");
const editAvatarPickerBtn = document.getElementById("edit-avatar-picker-btn");
const profileEmojiPickerWrapper = document.getElementById("profile-emoji-picker-wrapper");
const avatarPreview = document.getElementById("avatar-preview");
const colorOptions = document.querySelectorAll(".color-option");

// Profile state
let selectedEmoji = null;
let selectedAvatarColor = "#5865F2";

// Profile Card Elements
const userProfileCard = document.getElementById("user-profile-card");
const profileCardAvatar = document.getElementById("profile-card-avatar");
const profileCardUsername = document.getElementById("profile-card-username");
const profileCardBio = document.getElementById("profile-card-bio");
const profileCardStatus = document.getElementById("profile-card-status");
const profileCardCreated = document.getElementById("profile-card-created");

// Debug: Verify elements exist at initialization
console.log("═══════════════════════════════════════");
console.log("🔍 INITIALIZATION: Profile Card Elements");
console.log("═══════════════════════════════════════");
console.log("userProfileCard:", userProfileCard);
console.log("profileCardUsername:", profileCardUsername);
console.log("profileCardAvatar:", profileCardAvatar);
console.log("profileCardBio:", profileCardBio);
console.log("profileCardStatus:", profileCardStatus);
console.log("profileCardCreated:", profileCardCreated);

if (!userProfileCard) {
    console.error("❌ CRITICAL: user-profile-card element NOT FOUND in DOM!");
    console.error("Please check that the element exists in index.html");
} else {
    console.log("✅ user-profile-card found");
    console.log("  - ID:", userProfileCard.id);
    console.log("  - Classes:", userProfileCard.className);
    console.log("  - Has 'hidden' class:", userProfileCard.classList.contains("hidden"));
    const styles = window.getComputedStyle(userProfileCard);
    console.log("  - Computed display:", styles.display);
    console.log("  - Computed visibility:", styles.visibility);
    console.log("  - Computed z-index:", styles.zIndex);
}

if (!profileCardUsername) console.error("❌ profile-card-username element not found");
if (!profileCardAvatar) console.error("❌ profile-card-avatar element not found");
console.log("═══════════════════════════════════════");

const chatChannelName = document.getElementById("chat-channel-name");
const chatChannelDesc = document.getElementById("chat-channel-desc");
const messagesContainer = document.getElementById("messages");
const msgInput = document.getElementById("msg-input");
const btnSend = document.getElementById("btn-send");
const btnAttach = document.getElementById("btn-attach");
const fileInput = document.getElementById("file-input");
const filePreviewArea = document.getElementById("file-preview-area");
const filePreviewList = document.getElementById("file-preview-list");
const btnClearFiles = document.getElementById("btn-clear-files");

// Search elements
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchFilterUser = document.getElementById("search-filter-user");
const searchFilterDate = document.getElementById("search-filter-date");
const searchResultsCount = document.getElementById("search-results-count");
const btnSearch = document.getElementById("btn-search");
const btnCloseSearch = document.getElementById("btn-close-search");
const btnSearchPrev = document.getElementById("btn-search-prev");
const btnSearchNext = document.getElementById("btn-search-next");
const btnThemeToggle = document.getElementById("btn-theme-toggle");
const themeIconSun = document.getElementById("theme-icon-sun");
const themeIconMoon = document.getElementById("theme-icon-moon");
const btnPinnedMessages = document.getElementById("btn-pinned-messages");
const pinnedMessagesPanel = document.getElementById("pinned-messages-panel");
const pinnedMessagesList = document.getElementById("pinned-messages-list");
const btnClosePinned = document.getElementById("btn-close-pinned");

// File upload state
let selectedFiles = [];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_PER_UPLOAD = 10; // Maximum files per upload

// Allowed file types and extensions (must match backend)
const ALLOWED_FILE_TYPES = {
    // Images
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
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
    "text/csv": [".csv"]
};

const ALLOWED_EXTENSIONS = new Set();
Object.values(ALLOWED_FILE_TYPES).forEach(exts => {
    exts.forEach(ext => ALLOWED_EXTENSIONS.add(ext.toLowerCase()));
});

// Dangerous extensions to block
const DANGEROUS_EXTENSIONS = new Set([
    ".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar",
    ".sh", ".ps1", ".dll", ".msi", ".app", ".deb", ".rpm", ".dmg",
    ".php", ".asp", ".aspx", ".jsp", ".py", ".rb", ".pl", ".cgi"
]);

// Validate file before upload
function validateFile(file) {
    const errors = [];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" dépasse la taille maximale de 50MB`);
        return { valid: false, errors };
    }
    
    // Check if file is empty
    if (file.size === 0) {
        errors.push(`"${file.name}" est vide`);
        return { valid: false, errors };
    }
    
    // Get file extension
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.substring(fileName.lastIndexOf('.'));
    
    // Block dangerous extensions
    if (DANGEROUS_EXTENSIONS.has(fileExt)) {
        errors.push(`"${file.name}" est un type de fichier dangereux et n'est pas autorisé`);
        return { valid: false, errors };
    }
    
    // Check if extension is allowed
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
        errors.push(`"${file.name}" a une extension non autorisée`);
        return { valid: false, errors };
    }
    
    // Check MIME type
    if (!ALLOWED_FILE_TYPES[file.type]) {
        errors.push(`"${file.name}" a un type MIME non autorisé`);
        return { valid: false, errors };
    }
    
    // Verify MIME type matches extension
    const allowedExts = ALLOWED_FILE_TYPES[file.type];
    if (!allowedExts.includes(fileExt)) {
        errors.push(`"${file.name}" : le type MIME ne correspond pas à l'extension`);
        return { valid: false, errors };
    }
    
    // Check filename length
    if (file.name.length > 255) {
        errors.push(`"${file.name}" : le nom de fichier est trop long (max 255 caractères)`);
        return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
}

// --- AUTHENTICATION ---

// Navigation between views
btnGoToRegister.addEventListener("click", () => {
    showRegisterView();
});

btnGoToLogin.addEventListener("click", () => {
    showLoginView();
});

function showLoginView() {
    loginView.classList.remove("hidden");
    loginView.classList.add("active");
    registerView.classList.remove("active");
    registerView.classList.add("hidden");
    // Clear register form
    registerUsernameInput.value = "";
    registerPasswordInput.value = "";
    registerPasswordConfirmInput.value = "";
}

function showRegisterView() {
    registerView.classList.remove("hidden");
    registerView.classList.add("active");
    loginView.classList.remove("active");
    loginView.classList.add("hidden");
    // Clear login form
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
}

// Login handler
btnLogin.addEventListener("click", handleLogin);

loginPasswordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
});

async function handleLogin() {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if (!username || !password) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            login(data);
        } else {
            alert(data.error || "Erreur de connexion");
        }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion");
    }
}

// Register handler
btnRegister.addEventListener("click", handleRegister);

registerPasswordConfirmInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleRegister();
});

async function handleRegister() {
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const passwordConfirm = registerPasswordConfirmInput.value.trim();

    // Validation
    if (!username || !password || !passwordConfirm) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    if (password !== passwordConfirm) {
        alert("Les mots de passe ne correspondent pas");
        registerPasswordConfirmInput.focus();
        return;
    }

    if (password.length < 4) {
        alert("Le mot de passe doit contenir au moins 4 caractères");
        registerPasswordInput.focus();
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            login(data);
        } else {
            alert(data.error || "Erreur lors de l'inscription");
        }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion");
    }
}

const autocompleteList = document.getElementById("autocomplete-list");

// --- NOTIFICATIONS ---

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function sendNotification(title, body) {
    if (document.hidden && Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// --- AUTOCOMPLETE ---

msgInput.addEventListener("input", (e) => {
    const val = msgInput.value;
    const lastAt = val.lastIndexOf("@");

    if (lastAt !== -1) {
        const query = val.substring(lastAt + 1);
        // Check if there's a space after @, if so, stop suggesting unless it's part of the name (simplified: stop on space)
        if (query.includes(" ")) {
            closeAutocomplete();
            return;
        }

        const matches = users.filter(u => u.username.toLowerCase().startsWith(query.toLowerCase()) && u.id !== currentUser.id);

        if (matches.length > 0) {
            showAutocomplete(matches, lastAt);
        } else {
            closeAutocomplete();
        }
    } else {
        closeAutocomplete();
    }
});

function showAutocomplete(matches, atIndex) {
    autocompleteList.innerHTML = "";
    autocompleteList.classList.remove("hidden");

    matches.forEach(u => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = u.username;
        div.onclick = () => {
            selectAutocomplete(u.username, atIndex);
        };
        autocompleteList.appendChild(div);
    });
}

function selectAutocomplete(username, atIndex) {
    const val = msgInput.value;
    const before = val.substring(0, atIndex);
    // We replace everything after the @ with the username + space
    msgInput.value = before + "@" + username + " ";
    closeAutocomplete();
    msgInput.focus();
}

function closeAutocomplete() {
    autocompleteList.classList.add("hidden");
    autocompleteList.innerHTML = "";
}

// Close autocomplete when clicking outside
document.addEventListener("click", (e) => {
    if (e.target !== msgInput && e.target !== autocompleteList) {
        closeAutocomplete();
    }
});


const btnEmoji = document.getElementById("btn-emoji");
const emojiPickerContainer = document.getElementById("emoji-picker-container");
const emojiPicker = document.querySelector("emoji-picker");

let activeMessageForReaction = null; // To know which message we are reacting to

// --- EMOJI PICKER ---

function togglePicker(referenceElement) {
    if (!emojiPickerContainer.classList.contains("hidden")) {
        emojiPickerContainer.classList.add("hidden");
        return;
    }

    emojiPickerContainer.classList.remove("hidden");
    positionPicker(referenceElement);
}

function positionPicker(referenceElement) {
    const rect = referenceElement.getBoundingClientRect();
    const pickerWidth = 340; // Approx width
    const pickerHeight = 450; // Approx height

    // Horizontal
    let left = rect.left;
    if (left + pickerWidth > window.innerWidth) {
        left = window.innerWidth - pickerWidth - 20;
    }
    if (left < 20) left = 20;

    emojiPickerContainer.style.left = `${left}px`;
    emojiPickerContainer.style.right = "auto";

    // Vertical
    // Try above first
    let top = rect.top - pickerHeight - 10;

    // If not enough space above, try below
    if (top < 10) {
        top = rect.bottom + 10;
        // If not enough space below, stick to bottom
        if (top + pickerHeight > window.innerHeight) {
            top = window.innerHeight - pickerHeight - 10;
        }
    }

    emojiPickerContainer.style.top = `${top}px`;
    emojiPickerContainer.style.bottom = "auto";
}

btnEmoji.addEventListener("click", (e) => {
    e.stopPropagation();
    activeMessageForReaction = null;
    togglePicker(btnEmoji);
});

emojiPicker.addEventListener("emoji-click", (event) => {
    const emoji = event.detail.unicode;

    if (activeMessageForReaction) {
        // Add reaction to message
        addReaction(activeMessageForReaction, emoji);
        emojiPickerContainer.classList.add("hidden");
        activeMessageForReaction = null;
    } else {
        // Add to input
        msgInput.value += emoji;
        msgInput.focus();
    }
});

document.addEventListener("click", (e) => {
    if (!emojiPickerContainer.contains(e.target) && e.target !== btnEmoji && !e.target.closest(".add-reaction-btn")) {
        emojiPickerContainer.classList.add("hidden");
    }
});

function openReactionPicker(messageId, btnElement) {
    activeMessageForReaction = messageId;
    emojiPickerContainer.classList.remove("hidden");
    positionPicker(btnElement);
}

function addReaction(messageId, emoji) {
    if (!currentUser) return;

    const data = {
        message_id: messageId,
        emoji: emoji,
        user_id: currentUser.id
    };

    if (currentChannel) {
        data.channel_id = currentChannel.id;
    } else if (currentRecipient) {
        data.recipient_id = currentRecipient.id; // To notify recipient
    }

    socket.emit("add_reaction", data);
}

socket.on("reaction_update", (data) => {
    // Find the message element
    const msgElement = document.getElementById(`msg-${data.message_id}`);
    if (msgElement) {
        let reactionsContainer = msgElement.querySelector(".msg-reactions");
        if (!reactionsContainer) {
            // Should exist but just in case
            return;
        }

        // Check if reaction pill exists
        let pill = Array.from(reactionsContainer.children).find(p => p.dataset.emoji === data.emoji);

        if (data.action === "add") {
            if (pill) {
                // Update count
                const countSpan = pill.querySelector(".count");
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count + 1;

                // Check if it's me
                if (data.user_id === currentUser.id) {
                    pill.classList.add("active");
                }
            } else {
                // Create new pill
                // Insert before the add button
                pill = document.createElement("div");
                pill.className = `reaction-pill ${data.user_id === currentUser.id ? 'active' : ''}`;
                pill.dataset.emoji = data.emoji;
                pill.innerHTML = `${data.emoji} <span class="count">1</span>`;
                pill.onclick = () => addReaction(data.message_id, data.emoji);

                const addBtn = reactionsContainer.querySelector(".add-reaction-btn");
                reactionsContainer.insertBefore(pill, addBtn);
            }
        } else if (data.action === "remove") {
            if (pill) {
                const countSpan = pill.querySelector(".count");
                let count = parseInt(countSpan.textContent);

                if (count > 1) {
                    countSpan.textContent = count - 1;
                    if (data.user_id === currentUser.id) {
                        pill.classList.remove("active");
                    }
                } else {
                    // Remove pill if count goes to 0
                    pill.remove();
                }
            }
        }
    }
});

// --- CHAT ---

// Store all messages for search
let allMessages = [];
let isLoadingMore = false;
let hasMoreMessages = true;
let oldestMessageId = null;

socket.on("message_history", (messages) => {
    allMessages = messages; // Store for search
    messagesContainer.innerHTML = "";
    messages.forEach(msg => {
        // Handle deleted messages
        if (msg.deleted) {
            msg.message = "[Message supprimé]";
        }
        // Parse pinned status
        msg.pinned = msg.pinned === 1 || msg.pinned === true;
        displayMessage(msg);
    });
    
    // Track oldest message for pagination
    if (messages.length > 0) {
        oldestMessageId = messages[0].id; // First message is oldest (after reverse)
        hasMoreMessages = messages.length >= 50; // If we got 50, there might be more
    } else {
        hasMoreMessages = false;
    }
    
    scrollToBottom();
    
    // Update user filter dropdown
    updateSearchUserFilter();
    
    // Setup scroll listener for infinite scroll
    setupInfiniteScroll();
});

// Handle more messages from pagination
socket.on("more_messages", (messages) => {
    if (messages.length === 0) {
        hasMoreMessages = false;
        isLoadingMore = false;
        return;
    }
    
    // Store scroll position before adding messages
    const oldScrollHeight = messagesContainer.scrollHeight;
    const oldScrollTop = messagesContainer.scrollTop;
    
    // Add messages at the top
    messages.forEach(msg => {
        if (msg.deleted) {
            msg.message = "[Message supprimé]";
        }
        // Insert at the beginning
        const firstChild = messagesContainer.firstChild;
        const msgElement = displayMessage(msg, false); // Don't append, return element
        if (firstChild) {
            messagesContainer.insertBefore(msgElement, firstChild);
        } else {
            messagesContainer.appendChild(msgElement);
        }
    });
    
    // Add to allMessages at the beginning
    allMessages = [...messages, ...allMessages];
    
    // Track oldest message
    if (messages.length > 0) {
        oldestMessageId = messages[0].id;
        hasMoreMessages = messages.length >= 50;
    } else {
        hasMoreMessages = false;
    }
    
    // Restore scroll position
    const newScrollHeight = messagesContainer.scrollHeight;
    messagesContainer.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
    
    isLoadingMore = false;
    
    // Update search filter
    updateSearchUserFilter();
});

socket.on("receive_message", (msg) => {
    // Logic to decide if we show the message
    let shouldDisplay = false;

    if (currentChannel && msg.channel_id === currentChannel.id) {
        shouldDisplay = true;
        
        // If message is from a new member, reload members list
        if (msg.sender_id && !channelMembers.find(m => m.id === msg.sender_id)) {
            loadChannelMembers(currentChannel.id);
        }
    } else if (currentRecipient && (msg.recipient_id === currentUser.id || msg.recipient_id === currentRecipient.id) && (msg.username === currentRecipient.username || msg.username === currentUser.username)) {
        shouldDisplay = true;
    }

    if (shouldDisplay) {
        // Add to allMessages for search
        // Parse pinned status
        msg.pinned = msg.pinned === 1 || msg.pinned === true;
        allMessages.push(msg);
        displayMessage(msg);
        scrollToBottom();
        
        // Update search if active
        if (searchPanel && !searchPanel.classList.contains("hidden")) {
            if (typeof performSearch === 'function') {
                performSearch();
            }
        }
    }

    // Notifications
    if (msg.username !== currentUser.username) {
        // Check for mention
        const isMentioned = msg.message.includes(`@${currentUser.username}`);
        const isDM = !!msg.recipient_id;

        if (isDM) {
            sendNotification(`Message de ${msg.username}`, msg.message);
        } else if (isMentioned) {
            sendNotification(`Mentionné par ${msg.username}`, msg.message);
        } else if (document.hidden) {
            // Optional: notify for all channel messages if hidden
            // sendNotification(`Nouveau message dans ${currentChannel ? currentChannel.name : 'Chat'}`, `${msg.username}: ${msg.message}`);
        }
    }
});

let activeReply = null; // { id, username, message }

const replyIndicator = document.getElementById("reply-indicator");
const replyToUsername = document.getElementById("reply-to-username");
const replyToText = document.getElementById("reply-to-text");
const btnCancelReply = document.getElementById("btn-cancel-reply");

btnCancelReply.addEventListener("click", cancelReply);

function startReply(messageId, username, message) {
    activeReply = { id: messageId, username, message };
    replyIndicator.classList.remove("hidden");
    replyToUsername.textContent = username;
    replyToText.textContent = message;
    msgInput.focus();
}

function cancelReply() {
    activeReply = null;
    replyIndicator.classList.add("hidden");
}

function displayMessage(data, append = true) {
    const div = document.createElement("div");
    // All messages aligned to the right
    div.className = "msg";
    div.id = `msg-${data.id}`;

    // Reply Context
    if (data.reply_to_id) {
        const replyDiv = document.createElement("div");
        replyDiv.className = "msg-reply-context";
        replyDiv.innerHTML = `<strong>${data.reply_username}</strong>: ${data.reply_message}`;
        replyDiv.onclick = () => {
            const target = document.getElementById(`msg-${data.reply_to_id}`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                target.classList.add("highlight"); // You could add CSS for this
                setTimeout(() => target.classList.remove("highlight"), 2000);
            }
        };
        div.appendChild(replyDiv);
    }

    // Message header with avatar and username
    const msgHeader = document.createElement("div");
    msgHeader.className = "msg-header";
    
    // Find user info from users array or create default
    let userInfo = users.find(u => u.username === data.username);
    
    // If it's the current user, use currentUser data
    if (data.username === currentUser.username) {
        userInfo = currentUser;
    }
    
    // Get sender_id from message data
    const senderId = data.sender_id || (userInfo ? userInfo.id : null) || (data.username === currentUser.username ? currentUser.id : null);
    
    console.log("📨 Message data for displayMessage:", {
        messageId: data.id,
        username: data.username,
        sender_id: data.sender_id,
        userInfoId: userInfo ? userInfo.id : null,
        computedSenderId: senderId,
        currentUserId: currentUser.id
    });
    
    // Get userId early for status indicator
    const userId = userInfo ? (userInfo.id || senderId) : (senderId || (data.username === currentUser.username ? currentUser.id : null));
    
    // If user not in cache but we have sender_id, load it
    if (!userInfo && senderId) {
        fetch(`http://localhost:3000/api/users/${senderId}`)
            .then(res => res.json())
            .then(user => {
                if (!users.find(u => u.id === user.id)) {
                    users.push(user);
                }
                // Update avatar and status in message
                const msgElement = document.getElementById(`msg-${data.id}`);
                if (msgElement) {
                    const avatar = msgElement.querySelector(".msg-avatar");
                    if (avatar) {
                        updateAvatarElement(avatar, user.avatar, user.username, user.avatar_color);
                    }
                    // Update status indicator
                    const statusIndicator = msgElement.querySelector(".status-indicator");
                    if (statusIndicator) {
                        const displayStatus = user.status === 'invisible' ? 'offline' : (user.status || 'online');
                        statusIndicator.className = `status-indicator ${displayStatus}`;
                    }
                }
            })
            .catch(() => {});
        userInfo = { username: data.username, id: senderId };
    } else if (!userInfo) {
        userInfo = { username: data.username, id: senderId };
    }
    
    // Create avatar container with status indicator
    const avatarContainer = document.createElement("div");
    avatarContainer.className = "avatar-container";
    avatarContainer.style.position = "relative";
    avatarContainer.style.display = "inline-block";
    
    const msgAvatar = document.createElement("div");
    msgAvatar.className = "msg-avatar";
    updateAvatarElement(msgAvatar, userInfo.avatar, data.username, userInfo.avatar_color);
    
    // Add status indicator
    const statusIndicator = document.createElement("div");
    // Get status from message data if available, otherwise from userInfo
    let displayStatus = data.sender_status || userInfo.status || 'online';
    // For invisible users, show as offline to others (except themselves)
    if (displayStatus === 'invisible' && userInfo.id !== currentUser.id) {
        displayStatus = 'offline';
    }
    statusIndicator.className = `status-indicator ${displayStatus}`;
    statusIndicator.style.position = "absolute";
    statusIndicator.style.bottom = "0";
    statusIndicator.style.right = "0";
    statusIndicator.style.width = "10px";
    statusIndicator.style.height = "10px";
    statusIndicator.style.border = "2px solid hsl(var(--background))";
    statusIndicator.style.borderRadius = "50%";
    if (userId) {
        statusIndicator.setAttribute("data-user-id", String(userId));
    }
    
    avatarContainer.appendChild(msgAvatar);
    avatarContainer.appendChild(statusIndicator);
    
    const pseudo = document.createElement("div");
    pseudo.className = "pseudo";
    pseudo.textContent = data.username;
    
    console.log("🔍 Checking if pseudo should be clickable:", {
        userId,
        username: data.username,
        currentUsername: currentUser.username,
        userInfo: userInfo,
        senderId: senderId,
        hasUserInfoId: !!userInfo.id,
        hasSenderId: !!senderId,
        isCurrentUser: data.username === currentUser.username
    });
    
    if (userId) {
        console.log("✅ Making pseudo clickable for:", { userId, username: data.username });
        pseudo.style.cursor = "pointer";
        pseudo.title = "Voir le profil";
        pseudo.setAttribute("data-user-id", String(userId));
        pseudo.setAttribute("data-username", data.username);
        pseudo.classList.add("clickable-username");
        
        // Create a dedicated click handler that directly calls showUserProfileCard
        const clickHandler = (e) => {
            console.log("🖱️ CLICK EVENT DETECTED!");
            console.log("Event details:", {
                type: e.type,
                target: e.target,
                currentTarget: e.currentTarget,
                bubbles: e.bubbles,
                cancelable: e.cancelable
            });
            
            e.stopPropagation();
            e.preventDefault();
            
            // Get values directly from the element
            const targetUserId = e.currentTarget.getAttribute("data-user-id");
            const targetUsername = e.currentTarget.getAttribute("data-username");
            
            console.log("📋 Extracted values from element:", { 
                targetUserId, 
                targetUsername,
                hasUserProfileCard: !!userProfileCard,
                userProfileCardClasses: userProfileCard ? userProfileCard.className : "N/A"
            });
            
            if (!targetUserId) {
                console.error("❌ ERROR: targetUserId is missing!");
                return false;
            }
            
            if (!userProfileCard) {
                console.error("❌ ERROR: userProfileCard element is null!");
                alert("Erreur: La carte de profil n'a pas été trouvée dans le DOM");
                return false;
            }
            
            // Get position of clicked element for card positioning
            const rect = e.currentTarget.getBoundingClientRect();
            console.log("📍 Click position:", { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
            
            console.log("🚀 Calling showUserProfileCard with:", { targetUserId, targetUsername });
            showUserProfileCard(targetUserId, targetUsername, rect);
            
            return false;
        };
        
        // Use capture phase to catch the event early
        pseudo.addEventListener("click", clickHandler, true);
        console.log("✅ Event listener added to pseudo element");
    } else {
        const reason = !userId ? "No userId" : (data.username === currentUser.username ? "Same as current user" : "Unknown reason");
        console.log("❌ Pseudo NOT made clickable:", {
            reason: reason,
            userId: userId,
            dataUsername: data.username,
            currentUsername: currentUser.username,
            userInfoId: userInfo.id,
            senderId: senderId,
            userInfo: userInfo
        });
        
        // If it's not the current user but has no userId, try to load it
        if (!userId && data.username !== currentUser.username && data.sender_id) {
            console.log("⚠️ No userId found, but sender_id exists. Attempting to load user profile...");
            // We'll load it asynchronously, but for now just log
            console.log("sender_id from data:", data.sender_id);
        }
    }
    
    msgHeader.appendChild(avatarContainer);
    msgHeader.appendChild(pseudo);

    const content = document.createElement("div");
    content.className = "msg-content";

    // Pin indicator
    if (data.pinned) {
        const pinIndicator = document.createElement("div");
        pinIndicator.className = "msg-pinned-indicator";
        pinIndicator.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            Épinglé
        `;
        content.appendChild(pinIndicator);
    }

    // Handle file attachments (support multiple files)
    const filesToDisplay = data.files || (data.file_path ? [{
        file_path: data.file_path,
        file_name: data.file_name,
        file_type: data.file_type,
        file_size: data.file_size
    }] : null);
    
    if (filesToDisplay && filesToDisplay.length > 0) {
        // Separate images from other files (like Discord)
        const imageFiles = filesToDisplay.filter(f => f.file_type && f.file_type.startsWith("image/"));
        const otherFiles = filesToDisplay.filter(f => !f.file_type || !f.file_type.startsWith("image/"));
        
        // Create container for all files
        const fileContainer = document.createElement("div");
        fileContainer.className = "msg-file-container";
        
        // Handle images in a grid (Discord-style)
        if (imageFiles.length > 0) {
            const imageGrid = document.createElement("div");
            imageGrid.className = `msg-image-grid msg-image-grid-${imageFiles.length}`;
            
            imageFiles.forEach((fileData, index) => {
                const fileName = fileData.file_name || "Image";
                const fileUrl = `${API_BASE_URL}${fileData.file_path}`;
                
                const imageWrapper = document.createElement("div");
                imageWrapper.className = "msg-image-wrapper";
                
                const img = document.createElement("img");
                img.className = "msg-file-image";
                img.alt = fileName;
                img.loading = "lazy";
                img.decoding = "async";
                // Use data-src for lazy loading with Intersection Observer
                img.dataset.src = fileUrl;
                img.onclick = () => window.open(fileUrl, "_blank");
                
                // Use Intersection Observer for better lazy loading
                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                observer.unobserve(img);
                            }
                        });
                    }, {
                        rootMargin: '50px' // Start loading 50px before image is visible
                    });
                    imageObserver.observe(img);
                } else {
                    // Fallback for browsers without IntersectionObserver
                    img.src = fileUrl;
                }
                
                imageWrapper.appendChild(img);
                imageGrid.appendChild(imageWrapper);
            });
            
            fileContainer.appendChild(imageGrid);
        }
        
        // Handle other files (documents, audio, video)
        otherFiles.forEach((fileData, index) => {
            const fileIcon = getFileIcon(fileData.file_type || "");
            const fileName = fileData.file_name || "Fichier";
            const fileSize = fileData.file_size ? formatFileSize(fileData.file_size) : "";
            const fileUrl = `${API_BASE_URL}${fileData.file_path}`;
            
            const fileElement = document.createElement("div");
            fileElement.className = "msg-file";
            
            // Determine file type and create appropriate display
            if (fileData.file_type && fileData.file_type.startsWith("audio/")) {
            // Audio player
            const audio = document.createElement("audio");
            audio.src = fileUrl;
            audio.controls = true;
            audio.className = "msg-file-audio";
            fileElement.appendChild(audio);
            } else if (fileData.file_type && fileData.file_type.startsWith("video/")) {
            // Video player
            const video = document.createElement("video");
            video.src = fileUrl;
            video.controls = true;
            video.className = "msg-file-video";
            fileElement.appendChild(video);
        } else {
            // Document or other file - show as link
            const fileLink = document.createElement("a");
            fileLink.href = fileUrl;
            fileLink.target = "_blank";
            fileLink.className = "msg-file-link";
            fileLink.innerHTML = `
                <span class="file-icon">${fileIcon}</span>
                <div class="file-info">
                    <span class="file-name">${fileName}</span>
                    ${fileSize ? `<span class="file-size">${fileSize}</span>` : ""}
                </div>
            `;
            fileElement.appendChild(fileLink);
        }
        
        fileContainer.appendChild(fileElement);
        });
        
        content.appendChild(fileContainer);
    }

    // Handle text message with mentions
    if (data.message) {
        let text = data.message;
        
        // Check if message is deleted
        if (data.deleted || text === "[Message supprimé]") {
            const textDiv = document.createElement("div");
            textDiv.className = "msg-text deleted";
            textDiv.innerHTML = '<em style="opacity: 0.6; font-style: italic;">Ce message a été supprimé</em>';
            content.appendChild(textDiv);
        } else {
        const mentionRegex = /@(\w+)/g;
        text = text.replace(mentionRegex, (match, username) => {
            if (username === currentUser.username) {
                return `<span class="mention highlight">${match}</span>`;
            }
            return `<span class="mention">${match}</span>`;
        });

        const textDiv = document.createElement("div");
        textDiv.className = "msg-text";
        textDiv.innerHTML = text;
            
            // Add "edited" indicator if message was edited
            if (data.edited) {
                const editedSpan = document.createElement("span");
                editedSpan.className = "msg-edited";
                editedSpan.textContent = " (modifié)";
                editedSpan.title = data.edited_at ? `Modifié le ${new Date(data.edited_at).toLocaleString("fr-FR")}` : "Modifié";
                textDiv.appendChild(editedSpan);
            }
            
        content.appendChild(textDiv);
        }
    }

    // Reactions Container
    const reactionsDiv = document.createElement("div");
    reactionsDiv.className = "msg-reactions";

    // Render existing reactions
    if (data.reactions) {
        // Group reactions by emoji
        const groups = {};
        data.reactions.forEach(r => {
            if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasMe: false };
            groups[r.emoji].count++;
            if (r.user_id === currentUser.id) groups[r.emoji].hasMe = true;
        });

        for (const [emoji, info] of Object.entries(groups)) {
            const pill = document.createElement("div");
            pill.className = `reaction-pill ${info.hasMe ? 'active' : ''}`;
            pill.dataset.emoji = emoji;
            pill.innerHTML = `${emoji} <span class="count">${info.count}</span>`;
            pill.onclick = () => addReaction(data.id, emoji);
            reactionsDiv.appendChild(pill);
        }
    }

    // Actions Container (Reaction + Reply)
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "msg-actions";

    // Pin/Unpin Button (only for own messages)
    if ((data.sender_id === currentUser.id || data.username === currentUser.username) && !data.deleted) {
        const pinBtn = document.createElement("button");
        pinBtn.className = "msg-action-btn";
        pinBtn.setAttribute('data-pin-btn', 'true');
        const isPinned = data.pinned === 1 || data.pinned === true;
        pinBtn.innerHTML = isPinned ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
        ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
        `;
        pinBtn.title = isPinned ? "Désépingler" : "Épingler";
        pinBtn.onclick = (e) => {
            e.stopPropagation();
            togglePinMessage(data.id, isPinned);
        };
        actionsDiv.appendChild(pinBtn);
    }

    // Add Reaction Button
    const addBtn = document.createElement("button");
    addBtn.className = "msg-action-btn";
    const plusIcon = Icons.get("plus", 16);
    if (plusIcon) addBtn.appendChild(plusIcon);
    addBtn.title = "Ajouter une réaction";
    addBtn.onclick = (e) => {
        e.stopPropagation();
        openReactionPicker(data.id, addBtn);
    };
    actionsDiv.appendChild(addBtn);

    // Reply Button
    const replyBtn = document.createElement("button");
    replyBtn.className = "msg-action-btn";
    const replyIcon = Icons.get("reply", 16);
    if (replyIcon) replyBtn.appendChild(replyIcon);
    replyBtn.title = "Répondre";
    replyBtn.onclick = (e) => {
        e.stopPropagation();
        startReply(data.id, data.username, data.message);
    };
    actionsDiv.appendChild(replyBtn);

    // Edit and Delete buttons (only for own messages and not deleted)
    if ((data.sender_id === currentUser.id || data.username === currentUser.username) && !data.deleted) {
        // Edit Button (only if message has text content, not just files)
        if (data.message && data.message.trim() && data.message !== "[Message supprimé]") {
            const editBtn = document.createElement("button");
            editBtn.className = "msg-action-btn";
            const editIcon = Icons.get("edit", 16);
            if (editIcon) editBtn.appendChild(editIcon);
            editBtn.title = "Modifier";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                startEditMessage(data.id, data.message, data.channel_id, data.recipient_id);
            };
            actionsDiv.appendChild(editBtn);
        }

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "msg-action-btn";
        const trashIcon = Icons.get("trash", 16);
        if (trashIcon) deleteBtn.appendChild(trashIcon);
        deleteBtn.title = "Supprimer";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMessage(data.id, data.channel_id, data.recipient_id);
        };
        actionsDiv.appendChild(deleteBtn);
    }

    reactionsDiv.appendChild(actionsDiv);

    div.appendChild(msgHeader);
    div.appendChild(content);
    div.appendChild(reactionsDiv);

    if (append) {
        messagesContainer.appendChild(div);
    }
    return div;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Setup infinite scroll
function setupInfiniteScroll() {
    // Remove existing listener if any
    if (messagesContainer._scrollListener) {
        messagesContainer.removeEventListener("scroll", messagesContainer._scrollListener);
    }
    
    messagesContainer._scrollListener = () => {
        // Check if scrolled near the top (within 200px)
        if (messagesContainer.scrollTop < 200 && !isLoadingMore && hasMoreMessages) {
            loadMoreMessages();
        }
    };
    
    messagesContainer.addEventListener("scroll", messagesContainer._scrollListener);
}

// Load more messages
function loadMoreMessages() {
    if (isLoadingMore || !hasMoreMessages || !oldestMessageId) return;
    
    isLoadingMore = true;
    
    const data = {
        beforeMessageId: oldestMessageId,
        limit: 50
    };
    
    if (currentChannel) {
        data.channelId = currentChannel.id;
    } else if (currentRecipient && currentUser) {
        data.recipientId = currentRecipient.id;
        data.myId = currentUser.id;
    }
    
    socket.emit("load_more_messages", data);
}

async function sendMessage() {
    const message = msgInput.value.trim();
    if (!currentUser) return;
    
    // If no message and no files, don't send
    if (!message && selectedFiles.length === 0) return;

    // Upload files first if any
    let uploadedFiles = [];
    if (selectedFiles.length > 0) {
        try {
            uploadedFiles = await uploadFiles(selectedFiles);
        } catch (e) {
            console.error("Erreur upload fichiers", e);
            alert("Erreur lors de l'upload des fichiers: " + e.message);
            return;
        }
    }

    // Send message with all files in one message
    if (uploadedFiles.length > 0) {
        // Prepare files array
        const files = uploadedFiles.map(file => ({
                file_path: file.path,
                file_name: file.originalName,
                file_type: file.mimetype,
                file_size: file.size
        }));

        const payload = {
            username: currentUser.username,
            message: message || (uploadedFiles.length === 1 ? uploadedFiles[0].originalName : `${uploadedFiles.length} fichiers`),
            reply_to_id: activeReply ? activeReply.id : null,
            files: files
            };

            if (currentChannel) {
                payload.channel_id = currentChannel.id;
                payload.sender_id = currentUser.id;
            } else if (currentRecipient) {
                payload.recipient_id = currentRecipient.id;
                payload.sender_id = currentUser.id;
            }

            socket.emit("send_message", payload);
    } else {
        // Regular text message
        const payload = {
            username: currentUser.username,
            message: message,
            reply_to_id: activeReply ? activeReply.id : null
        };

        if (currentChannel) {
            payload.channel_id = currentChannel.id;
            payload.sender_id = currentUser.id;
            socket.emit("send_message", payload);
        } else if (currentRecipient) {
            payload.recipient_id = currentRecipient.id;
            payload.sender_id = currentUser.id;
            socket.emit("send_message", payload);
        }
    }

    msgInput.value = "";
    clearSelectedFiles();
    cancelReply();
    closeAutocomplete();
    stopTyping(); // Stop typing indicator when message is sent
}

// Edit message functionality
let editingMessageId = null;
let editingMessageElement = null;
let originalMessageText = null;

function startEditMessage(messageId, currentMessage, channelId, recipientId) {
    editingMessageId = messageId;
    
    // Find the message element
    const msgElement = document.getElementById(`msg-${messageId}`);
    if (!msgElement) return;
    
    editingMessageElement = msgElement;
    const textDiv = msgElement.querySelector(".msg-text");
    if (!textDiv) return;
    
    // Get the original text (remove HTML from mentions and edited indicator)
    originalMessageText = textDiv.textContent.replace(/\s*\(modifié\)$/, "").trim();
    
    // Create edit input
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "msg-edit-input";
    editInput.value = originalMessageText;
    
    // Replace text div with input
    const parent = textDiv.parentNode;
    parent.replaceChild(editInput, textDiv);
    editInput.focus();
    editInput.select();
    
    // Create buttons container
    const editActions = document.createElement("div");
    editActions.className = "msg-edit-actions";
    
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Enregistrer";
    saveBtn.className = "msg-edit-btn save";
    saveBtn.onclick = () => {
        const newMessage = editInput.value.trim();
        if (newMessage && newMessage !== originalMessageText) {
            saveEditMessage(messageId, newMessage, channelId, recipientId);
        } else {
            cancelEditMessage();
        }
    };
    
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Annuler";
    cancelBtn.className = "msg-edit-btn cancel";
    cancelBtn.onclick = cancelEditMessage;
    
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    parent.appendChild(editActions);
    
    // Handle Enter and Escape keys
    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            saveBtn.click();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEditMessage();
        }
    });
}

function cancelEditMessage() {
    if (!editingMessageElement || !editingMessageId || !originalMessageText) return;
    
    const msgElement = editingMessageElement;
    const editInput = msgElement.querySelector(".msg-edit-input");
    const editActions = msgElement.querySelector(".msg-edit-actions");
    
    if (editInput) {
        // Restore original text div
        const parent = editInput.parentNode;
        const textDiv = document.createElement("div");
        textDiv.className = "msg-text";
        
        // Process mentions
        let text = originalMessageText;
        const mentionRegex = /@(\w+)/g;
        text = text.replace(mentionRegex, (match, username) => {
            if (username === currentUser.username) {
                return `<span class="mention highlight">${match}</span>`;
            }
            return `<span class="mention">${match}</span>`;
        });
        
        textDiv.innerHTML = text;
        parent.replaceChild(textDiv, editInput);
    }
    
    if (editActions) {
        editActions.remove();
    }
    
    editingMessageId = null;
    editingMessageElement = null;
    originalMessageText = null;
}

function saveEditMessage(messageId, newMessage, channelId, recipientId) {
    if (!currentUser) return;
    
    const data = {
        message_id: messageId,
        new_message: newMessage,
        user_id: currentUser.id,
        channel_id: channelId || null,
        recipient_id: recipientId || null
    };
    
    socket.emit("edit_message", data);
    
    editingMessageId = null;
    editingMessageElement = null;
    originalMessageText = null;
}

function deleteMessage(messageId, channelId, recipientId) {
    if (!currentUser) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
        return;
    }
    
    const data = {
        message_id: messageId,
        user_id: currentUser.id,
        channel_id: channelId || null,
        recipient_id: recipientId || null
    };
    
    socket.emit("delete_message", data);
}

// Listen for message edit events
socket.on("message_edited", (data) => {
    const msgElement = document.getElementById(`msg-${data.id}`);
    if (msgElement) {
        const textDiv = msgElement.querySelector(".msg-text");
        const editInput = msgElement.querySelector(".msg-edit-input");
        const editActions = msgElement.querySelector(".msg-edit-actions");
        
        if (editInput) {
            // Remove edit UI
            const parent = editInput.parentNode;
            const newTextDiv = document.createElement("div");
            newTextDiv.className = "msg-text";
            
            // Process mentions
            let text = data.message;
            const mentionRegex = /@(\w+)/g;
            text = text.replace(mentionRegex, (match, username) => {
                if (username === currentUser.username) {
                    return `<span class="mention highlight">${match}</span>`;
                }
                return `<span class="mention">${match}</span>`;
            });
            
            newTextDiv.innerHTML = text;
            
            // Add edited indicator
            const editedSpan = document.createElement("span");
            editedSpan.className = "msg-edited";
            editedSpan.textContent = " (modifié)";
            editedSpan.title = data.edited_at ? `Modifié le ${new Date(data.edited_at).toLocaleString("fr-FR")}` : "Modifié";
            newTextDiv.appendChild(editedSpan);
            
            parent.replaceChild(newTextDiv, editInput);
        } else if (textDiv) {
            // Update existing message
            let text = data.message;
            const mentionRegex = /@(\w+)/g;
            text = text.replace(mentionRegex, (match, username) => {
                if (username === currentUser.username) {
                    return `<span class="mention highlight">${match}</span>`;
                }
                return `<span class="mention">${match}</span>`;
            });
            
            // Remove existing edited indicator
            const existingEdited = textDiv.querySelector(".msg-edited");
            if (existingEdited) {
                existingEdited.remove();
            }
            
            textDiv.innerHTML = text;
            
            // Add edited indicator
            const editedSpan = document.createElement("span");
            editedSpan.className = "msg-edited";
            editedSpan.textContent = " (modifié)";
            editedSpan.title = data.edited_at ? `Modifié le ${new Date(data.edited_at).toLocaleString("fr-FR")}` : "Modifié";
            textDiv.appendChild(editedSpan);
        }
        
        if (editActions) {
            editActions.remove();
        }
    }
});

// Listen for message delete events
socket.on("message_deleted", (data) => {
    const msgElement = document.getElementById(`msg-${data.id}`);
    if (msgElement) {
        const textDiv = msgElement.querySelector(".msg-text");
        if (textDiv) {
            textDiv.className = "msg-text deleted";
            textDiv.innerHTML = '<em style="opacity: 0.6; font-style: italic;">Ce message a été supprimé</em>';
        }
        
        // Hide action buttons
        const actionsDiv = msgElement.querySelector(".msg-actions");
        if (actionsDiv) {
            actionsDiv.style.display = "none";
        }
    }
});

socket.on("edit_message_error", (data) => {
    alert(data.error || "Erreur lors de la modification du message");
    cancelEditMessage();
});

socket.on("delete_message_error", (data) => {
    alert(data.error || "Erreur lors de la suppression du message");
});

async function uploadFiles(files) {
    // Validate all files before upload
    const validationErrors = [];
    for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
            validationErrors.push(...validation.errors);
        }
    }
    
    if (validationErrors.length > 0) {
        throw new Error("Erreurs de validation:\n" + validationErrors.join("\n"));
    }
    
    // Check total number of files
    if (files.length > MAX_FILES_PER_UPLOAD) {
        throw new Error(`Vous ne pouvez pas uploader plus de ${MAX_FILES_PER_UPLOAD} fichiers à la fois`);
    }
    
    const uploadPromises = [];
    
    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const promise = fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.error || "Erreur upload");
                });
            }
            return res.json();
        })
        .then(data => ({
            ...data,
            originalName: file.name,
            file: file
        }));

        uploadPromises.push(promise);
    }

    return Promise.all(uploadPromises);
}

function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function getFileIcon(mimeType) {
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📽️";
    if (mimeType === "text/plain" || mimeType === "text/csv") return "📃";
    return "📎";
}

// File upload handlers
console.log("🔧 Initializing file upload handlers...", {
    btnAttach: !!btnAttach,
    fileInput: !!fileInput,
    filePreviewArea: !!filePreviewArea,
    filePreviewList: !!filePreviewList,
    btnClearFiles: !!btnClearFiles
});

if (btnAttach) {
    btnAttach.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("📎 Attach button clicked");
        if (fileInput) {
            console.log("📂 Opening file picker...");
            fileInput.click();
        } else {
            console.error("❌ fileInput not found!");
        }
    });
} else {
    console.error("❌ btnAttach not found in DOM!");
}

if (fileInput) {
    fileInput.addEventListener("change", (e) => {
        console.log("📁 File input changed", e.target.files);
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            console.log(`✅ ${files.length} file(s) selected`);
            handleFileSelection(files);
        } else {
            console.log("⚠️ No files selected");
        }
        // Reset input to allow selecting the same file again
        e.target.value = "";
    });
} else {
    console.error("❌ fileInput not found in DOM!");
}

if (btnClearFiles) {
    btnClearFiles.addEventListener("click", () => {
        console.log("🗑️ Clearing selected files");
        clearSelectedFiles();
    });
} else {
    console.warn("⚠️ btnClearFiles not found in DOM");
}

function handleFileSelection(files) {
    const validFiles = [];
    const errors = [];
    
    // Check total number of files
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > MAX_FILES_PER_UPLOAD) {
        alert(`Vous ne pouvez pas sélectionner plus de ${MAX_FILES_PER_UPLOAD} fichiers à la fois`);
        return;
    }

    files.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
            validFiles.push(file);
        } else {
            errors.push(...validation.errors);
        }
    });

    if (errors.length > 0) {
        alert("Erreurs de validation:\n" + errors.join("\n"));
    }

    if (validFiles.length > 0) {
        selectedFiles = [...selectedFiles, ...validFiles];
        renderFilePreviews();
    }
}

function renderFilePreviews() {
    console.log("🎨 Rendering file previews...", {
        selectedFilesCount: selectedFiles.length,
        filePreviewList: !!filePreviewList,
        filePreviewArea: !!filePreviewArea
    });

    if (!filePreviewList || !filePreviewArea) {
        console.error("❌ filePreviewList or filePreviewArea not found!");
        return;
    }

    filePreviewList.innerHTML = "";

    if (selectedFiles.length === 0) {
        console.log("📭 No files to preview, hiding area");
        filePreviewArea.classList.add("hidden");
        return;
    }

    console.log("✅ Showing file preview area with", selectedFiles.length, "file(s)");
    filePreviewArea.classList.remove("hidden");

    selectedFiles.forEach((file, index) => {
        const preview = document.createElement("div");
        preview.className = "file-preview-item";
        
        const icon = getFileIcon(file.type);
        const size = formatFileSize(file.size);

        preview.innerHTML = `
            <div class="file-preview-icon">${icon}</div>
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${size}</div>
            </div>
            <button class="file-preview-remove" data-index="${index}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        const removeBtn = preview.querySelector(".file-preview-remove");
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedFiles.splice(index, 1);
            renderFilePreviews();
        });

        filePreviewList.appendChild(preview);
    });
}

function clearSelectedFiles() {
    selectedFiles = [];
    renderFilePreviews();
}

// Typing indicator state
let typingTimeout = null;
let isTyping = false;
const TYPING_DELAY = 1000; // Emit typing event after 1 second of inactivity
const TYPING_STOP_DELAY = 3000; // Stop typing indicator after 3 seconds

// Typing indicator elements
const typingIndicator = document.getElementById("typing-indicator");
const typingContent = typingIndicator ? typingIndicator.querySelector(".typing-content") : null;

// Track users who are typing
const typingUsers = new Map();

// Handle typing events
function handleTyping() {
    if (!currentUser) return;
    
    // Clear existing timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // If not already typing, emit typing event
    if (!isTyping) {
        isTyping = true;
        emitTyping();
    }
    
    // Reset timeout to stop typing
    typingTimeout = setTimeout(() => {
        stopTyping();
    }, TYPING_STOP_DELAY);
}

function emitTyping() {
    if (!currentUser) return;
    
    const data = {
        username: currentUser.username,
        user_id: currentUser.id
    };
    
    if (currentChannel) {
        data.channel_id = currentChannel.id;
        socket.emit("typing", data);
    } else if (currentRecipient) {
        data.recipient_id = currentRecipient.id;
        socket.emit("typing", data);
    }
}

function stopTyping() {
    if (!isTyping || !currentUser) return;
    
    isTyping = false;
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
    
    const data = {
        username: currentUser.username,
        user_id: currentUser.id
    };
    
    if (currentChannel) {
        data.channel_id = currentChannel.id;
        socket.emit("stop_typing", data);
    } else if (currentRecipient) {
        data.recipient_id = currentRecipient.id;
        socket.emit("stop_typing", data);
    }
}

// Listen for typing events from other users
socket.on("user_typing", (data) => {
    // Don't show typing indicator for current user
    if (data.user_id === currentUser.id) return;
    
    // Check if we should display this typing indicator
    let shouldDisplay = false;
    
    if (currentChannel && data.channel_id === currentChannel.id) {
        shouldDisplay = true;
    } else if (currentRecipient && (data.recipient_id === currentUser.id || data.recipient_id === currentRecipient.id)) {
        shouldDisplay = true;
    }
    
    if (shouldDisplay) {
        // Add or update typing user
        typingUsers.set(data.user_id, {
            username: data.username,
            timeout: setTimeout(() => {
                typingUsers.delete(data.user_id);
                updateTypingIndicator();
            }, TYPING_STOP_DELAY)
        });
        
        // Clear existing timeout if user was already typing
        const existing = typingUsers.get(data.user_id);
        if (existing && existing.timeout) {
            clearTimeout(existing.timeout);
            existing.timeout = setTimeout(() => {
                typingUsers.delete(data.user_id);
                updateTypingIndicator();
            }, TYPING_STOP_DELAY);
        }
        
        updateTypingIndicator();
    }
});

socket.on("user_stopped_typing", (data) => {
    if (data.user_id === currentUser.id) return;
    
    const user = typingUsers.get(data.user_id);
    if (user && user.timeout) {
        clearTimeout(user.timeout);
    }
    typingUsers.delete(data.user_id);
    updateTypingIndicator();
});

function updateTypingIndicator() {
    if (!typingIndicator || !typingContent) return;
    
    const users = Array.from(typingUsers.values());
    
    if (users.length === 0) {
        typingIndicator.classList.add("hidden");
        return;
    }
    
    // Format like Discord: "username is typing..." or "user1 and user2 are typing..."
    let text = "";
    if (users.length === 1) {
        text = `<strong>${users[0].username}</strong> tape`;
    } else if (users.length === 2) {
        text = `<strong>${users[0].username}</strong> et <strong>${users[1].username}</strong> tapent`;
    } else {
        text = `<strong>${users[0].username}</strong> et <strong>${users.length - 1} autre${users.length - 1 > 1 ? 's' : ''}</strong> tapent`;
    }
    
    typingContent.innerHTML = text;
    typingIndicator.classList.remove("hidden");
}

// Add typing event listeners to input
msgInput.addEventListener("input", () => {
    handleTyping();
});

msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        stopTyping();
    } else {
        handleTyping();
    }
});

btnSend.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        stopTyping();
        sendMessage();
    }
});

function login(user) {
    currentUser = user;
    if (user.token) {
        localStorage.setItem("chat_token", user.token);
    }

    loginView.classList.remove("active");
    loginView.classList.add("hidden");
    registerView.classList.remove("active");
    registerView.classList.add("hidden");
    chatView.classList.remove("hidden");
    chatView.classList.add("active");

    currentUsernameDisplay.textContent = user.username;
    updateUserAvatar(user);
    updateUserStatusUI(user);

    socket.emit("user_login", user.id);
    requestNotificationPermission();

    loadChannels();
    loadConversations();
    loadUserProfile().then(() => {
        // Add current user to users array for message display
        if (currentUser && !users.find(u => u.id === currentUser.id)) {
            users.push(currentUser);
        }
        
        // Initialize status to online on login (unless invisible or offline)
        // Do this after profile load to respect user's chosen status
        if (currentUser && (!currentUser.status || currentUser.status === 'offline')) {
            updateUserStatus('online');
        } else if (currentUser && currentUser.status === 'online') {
            // Initialize idle timer if user is online
            resetIdleTimer();
        }
    });
}

// Helper function to update avatar element (emoji or image URL)
function updateAvatarElement(element, avatar, username, avatarColor = null) {
    if (!element) return;
    
    if (avatar) {
        // Check if it's a URL (starts with http:// or https://)
        if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) {
            element.style.backgroundImage = `url(${avatar})`;
            element.style.backgroundSize = "cover";
            element.style.backgroundPosition = "center";
            element.textContent = "";
            if (avatarColor) {
                element.style.backgroundColor = avatarColor;
            }
        } else {
            // It's an emoji or text
            element.textContent = avatar;
            element.style.backgroundImage = "";
            element.style.backgroundSize = "";
            element.style.backgroundPosition = "";
            if (avatarColor) {
                element.style.backgroundColor = avatarColor;
            }
        }
    } else {
        element.textContent = username ? username.charAt(0).toUpperCase() : "?";
        element.style.backgroundImage = "";
        element.style.backgroundSize = "";
        element.style.backgroundPosition = "";
        if (avatarColor) {
            element.style.backgroundColor = avatarColor;
        }
    }
}

function updateUserAvatar(user) {
    updateAvatarElement(userAvatar, user.avatar, user.username, user.avatar_color);
}

function updateUserStatusUI(user) {
    if (userStatusIndicator && user.status) {
        userStatusIndicator.className = `status-indicator ${user.status}`;
    }
}

async function loadUserProfile() {
    if (!currentUser || !currentUser.token) return;
    
    try {
        const res = await fetch("http://localhost:3000/api/me", {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const profile = await res.json();
            currentUser = { ...currentUser, ...profile };
            updateUserAvatar(currentUser);
            updateUserStatusUI(currentUser);
        }
    } catch (e) {
        console.error("Erreur chargement profil", e);
    }
}

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("chat_token");
    window.location.reload();
});

// --- PROFILE MANAGEMENT ---

btnUserProfile.addEventListener("click", () => {
    openProfileModal();
});

closeProfileModal.addEventListener("click", () => {
    closeProfileModalFunc();
});

cancelProfileEdit.addEventListener("click", () => {
    closeProfileModalFunc();
});

profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) {
        closeProfileModalFunc();
    }
});

async function openProfileModal() {
    if (!currentUser) return;
    
    try {
        const res = await fetch("http://localhost:3000/api/me", {
            headers: { "Authorization": `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const profile = await res.json();
            currentUser = { ...currentUser, ...profile };
            
            profileUsername.value = profile.username || "";
            profileBio.value = profile.bio || "";
            profileStatus.value = profile.status || "online";
            
            // Parse avatar and color
            selectedEmoji = profile.avatar || null;
            selectedAvatarColor = profile.avatar_color || "#5865F2";
            
            // Update color options
            colorOptions.forEach(btn => {
                if (btn.dataset.color === selectedAvatarColor) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
            
            updateProfileAvatarPreview();
            updateProfileAvatarDisplay(selectedEmoji || profile.username.charAt(0).toUpperCase());
            updateProfileStatusDisplay(profile.status || "online");
            
            // Initialize emoji picker if not already done
            if (!profileEmojiPickerWrapper.querySelector("emoji-picker")) {
                const picker = document.createElement("emoji-picker");
                picker.classList.add("light");
                profileEmojiPickerWrapper.appendChild(picker);
                
                picker.addEventListener("emoji-click", (event) => {
                    selectedEmoji = event.detail.unicode;
                    updateProfileAvatarPreview();
                    profileEmojiPickerWrapper.classList.add("hidden");
                });
            }
            
            profileModal.classList.remove("hidden");
        }
    } catch (e) {
        console.error("Erreur chargement profil", e);
        alert("Erreur lors du chargement du profil");
    }
}

function closeProfileModalFunc() {
    profileModal.classList.add("hidden");
}

function updateProfileAvatarDisplay(avatar) {
    updateAvatarElement(profileAvatarDisplay, avatar, currentUser ? currentUser.username : "", selectedAvatarColor);
}

function updateProfileAvatarPreview() {
    // Update the main avatar display
    if (profileAvatarDisplay) {
        if (selectedEmoji) {
            profileAvatarDisplay.textContent = selectedEmoji;
            profileAvatarDisplay.style.backgroundImage = "";
        } else {
            profileAvatarDisplay.textContent = currentUser ? currentUser.username.charAt(0).toUpperCase() : "?";
            profileAvatarDisplay.style.backgroundImage = "";
        }
        profileAvatarDisplay.style.backgroundColor = selectedAvatarColor;
    }
}

function updateProfileStatusDisplay(status) {
    if (profileStatusDisplay) {
        profileStatusDisplay.className = `status-indicator profile-status-indicator ${status}`;
    }
}

// Edit avatar button (in header) - opens emoji picker
if (editAvatarBtn) {
    editAvatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (profileEmojiPickerWrapper) {
            profileEmojiPickerWrapper.classList.toggle("hidden");
        }
    });
}

// Close emoji picker when clicking outside
document.addEventListener("click", (e) => {
    if (profileEmojiPickerWrapper && !profileEmojiPickerWrapper.contains(e.target) && e.target !== editAvatarBtn && !editAvatarBtn.contains(e.target)) {
        profileEmojiPickerWrapper.classList.add("hidden");
    }
});

// Color picker
colorOptions.forEach(btn => {
    btn.addEventListener("click", () => {
        colorOptions.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedAvatarColor = btn.dataset.color;
        updateProfileAvatarPreview();
    });
});

saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    
    const bio = profileBio.value.trim();
    const status = profileStatus.value;
    const avatar = selectedEmoji || "";
    
    try {
        const res = await fetch(`http://localhost:3000/api/users/${currentUser.id}/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ 
                bio, 
                status, 
                avatar,
                avatar_color: selectedAvatarColor
            })
        });
        
        if (res.ok) {
            const updatedProfile = await res.json();
            currentUser = { ...currentUser, ...updatedProfile };
            updateUserAvatar(currentUser);
            updateUserStatusUI(currentUser);
            closeProfileModalFunc();
        } else {
            const error = await res.json();
            alert(error.error || "Erreur lors de la sauvegarde");
        }
    } catch (e) {
        console.error("Erreur sauvegarde profil", e);
        alert("Erreur de connexion");
    }
});

// Show profile card on username click in messages
function showUserProfileCard(userId, username, positionRect = null) {
    console.log("═══════════════════════════════════════");
    console.log("🎯 showUserProfileCard CALLED");
    console.log("Parameters:", { userId, username, type: typeof userId, positionRect });
    console.log("═══════════════════════════════════════");
    
    if (!userId) {
        console.error("❌ ERROR: userId is missing or falsy!");
        console.error("userId value:", userId, "type:", typeof userId);
        alert("Erreur: ID utilisateur manquant");
        return;
    }
    
    if (!userProfileCard) {
        console.error("❌ ERROR: userProfileCard element is null!");
        alert("Erreur: Élément de carte de profil introuvable");
        return;
    }
    
    console.log("✅ Pre-checks passed");
    console.log("Current card state:", {
        classes: userProfileCard.className,
        hidden: userProfileCard.classList.contains("hidden"),
        display: window.getComputedStyle(userProfileCard).display,
        visibility: window.getComputedStyle(userProfileCard).visibility,
        opacity: window.getComputedStyle(userProfileCard).opacity
    });
    
    // Show loading state
    if (profileCardUsername) {
        profileCardUsername.textContent = "Chargement...";
        console.log("✅ Set loading text in profileCardUsername");
    } else {
        console.error("❌ profileCardUsername is null!");
    }
    
    if (profileCardBio) {
        profileCardBio.textContent = "";
    } else {
        console.error("❌ profileCardBio is null!");
    }
    
    console.log("🌐 Fetching user profile from API...");
    console.log("URL:", `http://localhost:3000/api/users/${userId}`);
    
    fetch(`http://localhost:3000/api/users/${userId}`)
        .then(res => {
            console.log("📡 API Response received:", {
                ok: res.ok,
                status: res.status,
                statusText: res.statusText
            });
            
            if (!res.ok) {
                throw new Error(`Erreur HTTP: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(user => {
            console.log("✅ User profile data loaded:", user);
            
            // Update username
            if (profileCardUsername) {
                profileCardUsername.textContent = user.username;
                console.log("✅ Updated profileCardUsername to:", user.username);
            } else {
                console.error("❌ profileCardUsername is null, cannot update!");
            }
            
            // Update bio
            if (profileCardBio) {
                profileCardBio.textContent = user.bio || "Aucune bio";
                console.log("✅ Updated profileCardBio");
            } else {
                console.error("❌ profileCardBio is null, cannot update!");
            }
            
            // Update avatar
            if (profileCardAvatar) {
                updateAvatarElement(profileCardAvatar, user.avatar, user.username, user.avatar_color);
                console.log("✅ Updated profileCardAvatar");
            } else {
                console.error("❌ profileCardAvatar is null, cannot update!");
            }
            
            // Update status
            if (profileCardStatus && user.status) {
                profileCardStatus.className = `status-indicator ${user.status}`;
                console.log("✅ Updated profileCardStatus to:", user.status);
            }
            
            // Update created date
            if (profileCardCreated && user.created_at) {
                const date = new Date(user.created_at);
                profileCardCreated.textContent = date.toLocaleDateString("fr-FR", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                });
                console.log("✅ Updated profileCardCreated");
            }
            
            // Position the card near the clicked element (like emoji picker)
            if (positionRect && userProfileCard) {
                const cardWidth = 320;
                const cardHeight = 400; // Approximate height
                const spacing = 10;
                
                // Calculate position
                let left = positionRect.left + positionRect.width + spacing;
                let top = positionRect.top;
                
                // Adjust if card would go off screen
                if (left + cardWidth > window.innerWidth) {
                    // Position to the left of the element instead
                    left = positionRect.left - cardWidth - spacing;
                }
                
                // Adjust vertical position if needed
                if (top + cardHeight > window.innerHeight) {
                    top = window.innerHeight - cardHeight - 20;
                }
                if (top < 20) {
                    top = 20;
                }
                
                userProfileCard.style.left = `${left}px`;
                userProfileCard.style.top = `${top}px`;
                userProfileCard.style.right = "auto";
                
                console.log("📍 Positioned card at:", { left, top });
            }
            
            // Show the card
            console.log("🎨 Removing 'hidden' class from userProfileCard...");
            console.log("Before:", {
                classes: userProfileCard.className,
                hasHidden: userProfileCard.classList.contains("hidden")
            });
            
            userProfileCard.classList.remove("hidden");
            
            console.log("After:", {
                classes: userProfileCard.className,
                hasHidden: userProfileCard.classList.contains("hidden")
            });
            
            // Check computed styles
            const computedStyles = window.getComputedStyle(userProfileCard);
            console.log("📊 Computed styles after removal:", {
                display: computedStyles.display,
                visibility: computedStyles.visibility,
                opacity: computedStyles.opacity,
                zIndex: computedStyles.zIndex,
                position: computedStyles.position,
                left: computedStyles.left,
                top: computedStyles.top
            });
            
            // Force a reflow to ensure the change is applied
            void userProfileCard.offsetHeight;
            
            console.log("✅ Profile card should now be visible!");
            console.log("═══════════════════════════════════════");
        })
        .catch(e => {
            console.error("❌ ERROR in showUserProfileCard:", e);
            console.error("Error details:", {
                message: e.message,
                stack: e.stack,
                name: e.name
            });
            alert("Impossible de charger le profil de l'utilisateur: " + e.message);
        });
}

// Handle username click
function handleUsernameClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.currentTarget || e.target;
    const userId = target.getAttribute("data-user-id");
    const username = target.getAttribute("data-username");
    
    console.log("Username clicked:", { userId, username, target }); // Debug
    
    if (userId && userProfileCard) {
        showUserProfileCard(userId, username);
    } else {
        console.error("Missing userId or userProfileCard element", { userId, userProfileCard });
    }
    
    return false;
}

// TEST FUNCTION - For testing profile card display
// Use in console: testProfileCard(1) or testProfileCardShow(1)
window.testProfileCard = function(userId = 1) {
    console.log("🧪 TEST: Forcing profile card display for userId:", userId);
    if (userProfileCard) {
        userProfileCard.classList.remove("hidden");
        console.log("✅ Card should now be visible. Classes:", userProfileCard.className);
        const styles = window.getComputedStyle(userProfileCard);
        console.log("Computed styles:", {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex
        });
    } else {
        console.error("❌ userProfileCard not found");
    }
};

window.testProfileCardShow = function(userId = 1) {
    console.log("🧪 TEST: Calling showUserProfileCard for userId:", userId);
    showUserProfileCard(userId, "Test User");
};

// Close profile card when clicking outside
document.addEventListener("click", (e) => {
    // Don't close if clicking on a clickable username
    if (e.target.classList.contains("clickable-username") || e.target.closest(".clickable-username")) {
        return;
    }
    
    // Don't close if clicking inside the profile card
    if (userProfileCard && userProfileCard.contains(e.target)) {
        return;
    }
    
    // Close the card
    if (userProfileCard && !userProfileCard.classList.contains("hidden")) {
        userProfileCard.classList.add("hidden");
    }
});

// Auto-login check
async function checkSession() {
    const token = localStorage.getItem("chat_token");
    if (!token) return;

    try {
        // Show some loading state if you want, or just wait
        const res = await fetch("http://localhost:3000/api/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            const user = await res.json();
            login(user);
        } else {
            localStorage.removeItem("chat_token");
        }
    } catch (e) {
        console.error("Session check failed", e);
    }
}

checkSession();

const btnCreateChannel = document.getElementById("btn-create-channel");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");

// --- UI EVENTS ---

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove("open");
    }
});

socket.on("channel_created", (newChannel) => {
    channels.push(newChannel);
    renderChannels();
});

socket.on("channel_deleted", (channelId) => {
    channels = channels.filter(ch => ch.id !== channelId);
    renderChannels();
    // If we were in the deleted channel, switch to General
    if (currentChannel && currentChannel.id === channelId) {
        const general = channels.find(ch => ch.id === 1);
        if (general) joinChannel(general);
    }
});

function renderChannels() {
    channelsList.innerHTML = "";
    channels.forEach(ch => {
        const div = document.createElement("div");
        const isVoiceChannel = ch.voice_channel === 1;
        const isActiveVoiceChannel = isVoiceChannel && currentVoiceChannel && currentVoiceChannel.id === ch.id;
        const isActiveTextChannel = !isVoiceChannel && currentChannel && currentChannel.id === ch.id;
        
        div.className = `channel-item ${isActiveTextChannel ? 'active' : ''} ${isActiveVoiceChannel ? 'voice-active' : ''}`;

        const icon = ch.icon || (ch.voice_channel ? "🔊" : "💬");

        // Get participants count for voice channels
        let participantsCount = 0;
        if (isVoiceChannel) {
            const channelParticipants = voiceChannelParticipants.get(ch.id);
            if (channelParticipants) {
                participantsCount = channelParticipants.size;
            }
        }
        
        div.innerHTML = `
            <div class="channel-content">
                <span class="channel-icon">${icon}</span>
                <span class="channel-name">${ch.name}</span>
                ${isVoiceChannel ? `<span class="voice-badge">Vocal</span>` : ''}
                ${isVoiceChannel && participantsCount > 0 ? `<span class="voice-participants-count">${participantsCount}</span>` : ''}
                ${isActiveVoiceChannel ? '<span class="voice-active-indicator">●</span>' : ''}
            </div>
        `;

        // Settings Button (only if not General)
        if (ch.name !== 'Général' && ch.id != 1) {
            const settingsBtn = document.createElement("button");
            settingsBtn.className = "channel-settings-btn";
            const moreIcon = Icons.get("moreVertical", 16);
            if (moreIcon) settingsBtn.appendChild(moreIcon);
            settingsBtn.title = "Options";
            settingsBtn.onclick = (e) => {
                e.stopPropagation();
                // Show menu at button position
                const rect = settingsBtn.getBoundingClientRect();
                showContextMenu(rect.left, rect.bottom, ch);
            };
            div.appendChild(settingsBtn);
        }

        div.onclick = () => {
            if (ch.voice_channel === 1) {
                // Voice channel - join voice instead
                if (typeof joinVoiceChannel === 'function') {
                    joinVoiceChannel(ch);
                } else {
                    alert('Fonctionnalité vocale en cours de chargement...');
                }
            } else {
                // Text channel
                joinChannel(ch);
            }
            if (window.innerWidth <= 768) sidebar.classList.remove("open");
        };
        channelsList.appendChild(div);
    });
}

// Context Menu Logic
function showContextMenu(x, y, channel) {
    // Remove existing context menu if any
    const existing = document.querySelector(".context-menu");
    if (existing) existing.remove();

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // Delete Option (only if not General)
    if (channel.name !== 'Général' && channel.id != 1) {
        const deleteItem = document.createElement("div");
        deleteItem.className = "context-menu-item destructive";
        deleteItem.innerHTML = `Supprimer`;
        deleteItem.onclick = () => {
            if (confirm(`Voulez-vous vraiment supprimer le salon "${channel.name}" ?`)) {
                socket.emit("delete_channel", channel.id);
            }
            menu.remove();
        };
        menu.appendChild(deleteItem);
    } else {
        const infoItem = document.createElement("div");
        infoItem.className = "context-menu-item";
        infoItem.innerHTML = `<span style="opacity: 0.5; font-size: 0.8rem;">Aucune action disponible</span>`;
        menu.appendChild(infoItem);
    }

    document.body.appendChild(menu);

    // Close on click outside
    const closeMenu = () => {
        menu.remove();
        document.removeEventListener("click", closeMenu);
    };
    // Delay slightly to avoid immediate close
    setTimeout(() => document.addEventListener("click", closeMenu), 0);
}



// Update Create Channel Modal to use Emoji Picker
btnCreateChannel.addEventListener("click", () => {
    // Create Modal Structure
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.overflow = "visible"; // Allow picker to pop out if needed

    // Header
    const header = document.createElement("div");
    header.className = "modal-header";
    header.innerHTML = `
        <h3>Créer un salon</h3>
        <button class="icon-btn" id="close-modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    // Body
    const body = document.createElement("div");
    body.className = "modal-body";

    body.innerHTML = `
        <label class="modal-label">Nom du salon</label>
        <input type="text" id="channel-name" class="modal-input" placeholder="ex: Général" autofocus>
        
        <label class="modal-label">Icône</label>
        <div style="position: relative;">
            <button id="emoji-trigger-btn" class="modal-input" style="width: 60px; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💬</button>
            <div id="modal-emoji-picker-wrapper" class="hidden" style="position: absolute; top: 100%; left: 0; z-index: 1002; box-shadow: var(--shadow);">
                <!-- Emoji picker will be injected here -->
            </div>
        </div>
        
        <label class="modal-label" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
            <input type="checkbox" id="voice-channel-checkbox" style="width: auto;">
            <span>Canal vocal</span>
        </label>

        <div class="modal-actions">
            <button class="modal-btn secondary" id="cancel-btn">Annuler</button>
            <button class="modal-btn primary" id="create-btn">Créer</button>
        </div>
    `;

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const nameInput = body.querySelector("#channel-name");
    const emojiBtn = body.querySelector("#emoji-trigger-btn");
    const emojiWrapper = body.querySelector("#modal-emoji-picker-wrapper");
    const createBtn = body.querySelector("#create-btn");
    const cancelBtn = body.querySelector("#cancel-btn");
    const closeBtn = header.querySelector("#close-modal");

    let selectedEmoji = "💬";

    // Emoji Picker Logic
    const picker = document.createElement('emoji-picker');
    picker.classList.add('light'); // or dark based on theme
    emojiWrapper.appendChild(picker);

    emojiBtn.onclick = (e) => {
        e.stopPropagation();
        emojiWrapper.classList.toggle("hidden");
    };

    picker.addEventListener('emoji-click', event => {
        selectedEmoji = event.detail.unicode;
        emojiBtn.textContent = selectedEmoji;
        emojiWrapper.classList.add("hidden");
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiWrapper.contains(e.target) && e.target !== emojiBtn) {
            emojiWrapper.classList.add("hidden");
        }
    });

    const closeModal = () => document.body.removeChild(modalOverlay);

    const createChannel = () => {
        const name = nameInput.value.trim();
        const voiceChannelCheckbox = body.querySelector("#voice-channel-checkbox");
        const isVoiceChannel = voiceChannelCheckbox ? voiceChannelCheckbox.checked : false;

        if (name) {
            socket.emit("create_channel", { 
                name, 
                icon: isVoiceChannel ? "🔊" : selectedEmoji,
                voice_channel: isVoiceChannel
            });
            closeModal();
        } else {
            nameInput.style.borderColor = "red";
        }
    };

    createBtn.onclick = createChannel;
    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Enter key to submit
    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") createChannel();
    });
});

// --- CHANNELS & USERS ---

const btnNewDm = document.getElementById("btn-new-dm");

btnNewDm.addEventListener("click", async () => {
    // Fetch all users to pick from
    try {
        const res = await fetch("http://localhost:3000/api/users");
        const allUsers = await res.json();

        // Filter out current user
        const availableUsers = allUsers.filter(u => u.id !== currentUser.id);

        // Create Modal Structure
        const modalOverlay = document.createElement("div");
        modalOverlay.className = "modal-overlay";

        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        // Header
        const header = document.createElement("div");
        header.className = "modal-header";
        header.innerHTML = `
            <h3>Nouveau Message</h3>
            <button class="icon-btn" id="close-modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        `;

        // Body
        const body = document.createElement("div");
        body.className = "modal-body";

        // Search Input
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.className = "modal-input";
        searchInput.placeholder = "Rechercher un utilisateur...";
        searchInput.autofocus = true;

        // List Container
        const listContainer = document.createElement("div");
        listContainer.className = "modal-list";

        // Render List Function
        const renderList = (filter = "") => {
            listContainer.innerHTML = "";
            const filtered = availableUsers.filter(u => u.username.toLowerCase().includes(filter.toLowerCase()));

            if (filtered.length === 0) {
                listContainer.innerHTML = `<div style="text-align: center; color: hsl(var(--muted-foreground)); padding: 1rem;">Aucun utilisateur trouvé</div>`;
                return;
            }

            filtered.forEach(u => {
                const item = document.createElement("div");
                item.className = "modal-item";
                item.innerHTML = `
                    <div class="avatar-placeholder">${u.username.charAt(0).toUpperCase()}</div>
                    <span class="username">${u.username}</span>
                `;
                item.onclick = () => {
                    startDM(u);
                    // Add to sidebar if not exists
                    if (!users.find(existing => existing.id === u.id)) {
                        users.push(u);
                        renderUsers();
                    }
                    document.body.removeChild(modalOverlay);
                };
                listContainer.appendChild(item);
            });
        };

        // Initial Render
        renderList();

        // Search Event
        searchInput.addEventListener("input", (e) => {
            renderList(e.target.value);
        });

        // Assemble
        body.appendChild(searchInput);
        body.appendChild(listContainer);
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Focus input
        searchInput.focus();

        // Close Events
        const closeBtn = header.querySelector("#close-modal");
        closeBtn.onclick = () => document.body.removeChild(modalOverlay);

        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

    } catch (e) {
        console.error(e);
    }
});

// --- CHANNELS & USERS ---

async function loadChannels() {
    try {
        const res = await fetch("http://localhost:3000/api/channels");
        channels = await res.json();
        renderChannels();
        if (channels.length > 0 && !currentChannel && !currentRecipient) {
            joinChannel(channels[0]);
        }
    } catch (e) {
        console.error("Erreur chargement channels", e);
    }
}

async function loadConversations() {
    if (!currentUser) return;
    try {
        const res = await fetch(`http://localhost:3000/api/conversations/${currentUser.id}`);
        const conversations = await res.json();
        
        // Load full user profiles
        users = await Promise.all(conversations.map(async (user) => {
            try {
                const profileRes = await fetch(`http://localhost:3000/api/users/${user.id}`);
                if (profileRes.ok) {
                    return await profileRes.json();
                }
                return user;
            } catch (e) {
                return user;
            }
        }));
        
        renderUsers();
    } catch (e) {
        console.error("Erreur chargement conversations", e);
    }
}

// Load channel members
let channelMembers = [];

async function loadChannelMembers(channelId) {
    if (!channelId) return;
    
    try {
        const res = await fetch(`http://localhost:3000/api/channels/${channelId}/members`);
        if (res.ok) {
            channelMembers = await res.json();
            renderChannelMembers();
        } else {
            console.error("Erreur chargement membres channel");
            channelMembers = [];
            renderChannelMembers();
        }
    } catch (e) {
        console.error("Erreur chargement membres channel", e);
        channelMembers = [];
        renderChannelMembers();
    }
}

function renderChannelMembers() {
    if (!channelMembersList) return;
    
    channelMembersList.innerHTML = "";
    
    if (channelMembersCount) {
        channelMembersCount.textContent = `(${channelMembers.length})`;
    }
    
    if (channelMembers.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-members";
        emptyDiv.textContent = "Aucun membre";
        emptyDiv.style.padding = "0.5rem 0.75rem";
        emptyDiv.style.color = "hsl(var(--muted-foreground))";
        emptyDiv.style.fontSize = "0.875rem";
        channelMembersList.appendChild(emptyDiv);
        return;
    }
    
    channelMembers.forEach(member => {
        const div = document.createElement("div");
        div.className = "member-item";
        
        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        updateAvatarElement(avatar, member.avatar, member.username, member.avatar_color);
        
        const username = document.createElement("span");
        username.className = "member-username";
        username.textContent = member.username;
        
        const statusIndicator = document.createElement("div");
        statusIndicator.className = `status-indicator ${member.status || 'online'}`;
        statusIndicator.style.position = "absolute";
        statusIndicator.style.bottom = "0";
        statusIndicator.style.right = "0";
        
        const avatarContainer = document.createElement("div");
        avatarContainer.className = "avatar-container";
        avatarContainer.style.position = "relative";
        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(statusIndicator);
        
        div.appendChild(avatarContainer);
        div.appendChild(username);
        
        // Make member clickable to show profile
        div.style.cursor = "pointer";
        div.title = `Voir le profil de ${member.username}`;
        div.onclick = (e) => {
            e.stopPropagation();
            if (member.id) {
                const rect = div.getBoundingClientRect();
                showUserProfileCard(member.id, member.username, rect);
            }
        };
        
        channelMembersList.appendChild(div);
    });
}

socket.on("new_conversation", (user) => {
    // If we receive a message from a new user, add them to the list
    if (!users.find(u => u.id === user.id)) {
        users.push(u);
        renderUsers();
    }
});

function renderUsers() {
    usersList.innerHTML = "";
    users.forEach(u => {
        if (u.id === currentUser.id) return; // Don't show self
        const div = document.createElement("div");
        div.className = `channel-item ${currentRecipient && currentRecipient.id === u.id ? 'active' : ''}`;
        
        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        updateAvatarElement(avatar, u.avatar, u.username, u.avatar_color);
        
        const username = document.createElement("span");
        username.textContent = u.username;
        
        const statusIndicator = document.createElement("div");
        statusIndicator.className = `status-indicator ${u.status || 'online'}`;
        statusIndicator.style.position = "absolute";
        statusIndicator.style.bottom = "0";
        statusIndicator.style.right = "0";
        
        const avatarContainer = document.createElement("div");
        avatarContainer.className = "avatar-container";
        avatarContainer.style.position = "relative";
        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(statusIndicator);
        
        div.appendChild(avatarContainer);
        div.appendChild(username);
        
        div.onclick = () => {
            startDM(u);
            if (window.innerWidth <= 768) sidebar.classList.remove("open");
        };
        usersList.appendChild(div);
    });
}

const btnHeaderChannelSettings = document.getElementById("btn-header-channel-settings");

if (btnHeaderChannelSettings) {
    btnHeaderChannelSettings.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentChannel) {
            const rect = btnHeaderChannelSettings.getBoundingClientRect();
            // Align menu to the right of the button
            showContextMenu(rect.right - 150, rect.bottom, currentChannel);
        }
    });
}

function joinChannel(channel) {
    if (currentChannel) {
        socket.emit("leave_channel", currentChannel.id);
    }
    currentChannel = channel;
    currentRecipient = null; // Clear DM
    renderChannels();
    renderUsers();
    
    // Clear typing indicator when switching channels
    typingUsers.clear();
    updateTypingIndicator();
    stopTyping();

    chatChannelName.textContent = `# ${channel.name}`;
    chatChannelDesc.textContent = channel.description;
    messagesContainer.innerHTML = ""; // Clear messages
    allMessages = []; // Clear search messages
    oldestMessageId = null;
    hasMoreMessages = true;
    isLoadingMore = false;
    // Remove scroll listener
    if (messagesContainer._scrollListener) {
        messagesContainer.removeEventListener("scroll", messagesContainer._scrollListener);
        messagesContainer._scrollListener = null;
    }
    if (typeof closeSearch === 'function') {
        closeSearch(); // Close search when switching channels
    }

    // Header Settings Button Logic
    if (btnHeaderChannelSettings) {
        if (channel.name !== 'Général' && channel.id != 1) {
            btnHeaderChannelSettings.classList.remove("hidden");
        } else {
            btnHeaderChannelSettings.classList.add("hidden");
        }
    }

    // Load and display channel members
    loadChannelMembers(channel.id);
    
    // Show members section
    if (channelMembersHeader && channelMembersList) {
        channelMembersHeader.style.display = "flex";
        channelMembersList.style.display = "block";
    }

    socket.emit("join_channel", channel.id);
}

function startDM(user) {
    if (currentChannel) {
        socket.emit("leave_channel", currentChannel.id);
    }
    currentChannel = null;
    currentRecipient = user;
    renderChannels();
    renderUsers();
    
    // Clear typing indicator when switching to DM
    typingUsers.clear();
    updateTypingIndicator();
    stopTyping();

    chatChannelName.textContent = `@ ${user.username}`;
    chatChannelDesc.textContent = "Message privé";
    messagesContainer.innerHTML = "";
    allMessages = []; // Clear search messages
    oldestMessageId = null;
    hasMoreMessages = true;
    isLoadingMore = false;
    // Remove scroll listener
    if (messagesContainer._scrollListener) {
        messagesContainer.removeEventListener("scroll", messagesContainer._scrollListener);
        messagesContainer._scrollListener = null;
    }
    if (typeof closeSearch === 'function') {
        closeSearch(); // Close search when switching to DM
    }

    // Hide channel members section for DMs
    if (channelMembersHeader && channelMembersList) {
        channelMembersHeader.style.display = "none";
        channelMembersList.style.display = "none";
    }

    if (btnHeaderChannelSettings) {
        btnHeaderChannelSettings.classList.add("hidden");
    }

    socket.emit("join_dm", { myId: currentUser.id, otherId: user.id });
}

// --- SEARCH FUNCTIONALITY ---

// Search state
let searchResults = [];
let currentSearchIndex = -1;
let isSearchActive = false;

// Initialize search
if (btnSearch && searchPanel) {
    btnSearch.addEventListener("click", () => {
        searchPanel.classList.remove("hidden");
        if (searchInput) searchInput.focus();
        isSearchActive = true;
    });
}

if (btnCloseSearch) {
    btnCloseSearch.addEventListener("click", () => {
        closeSearch();
    });
}

// Close search with Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchPanel && !searchPanel.classList.contains("hidden")) {
        closeSearch();
    }
});

function closeSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add("hidden");
    if (searchInput) searchInput.value = "";
    if (searchFilterUser) searchFilterUser.value = "";
    if (searchFilterDate) searchFilterDate.value = "";
    clearSearchResults();
    isSearchActive = false;
}

// Update user filter dropdown
function updateSearchUserFilter() {
    if (!searchFilterUser) return;
    
    // Get unique users from messages
    const userMap = new Map();
    allMessages.forEach(msg => {
        if (msg.username && msg.sender_id) {
            if (!userMap.has(msg.sender_id)) {
                userMap.set(msg.sender_id, msg.username);
            }
        }
    });
    
    // Clear existing options except "Tous les utilisateurs"
    searchFilterUser.innerHTML = '<option value="">Tous les utilisateurs</option>';
    
    // Add user options
    userMap.forEach((username, userId) => {
        const option = document.createElement("option");
        option.value = userId;
        option.textContent = username;
        searchFilterUser.appendChild(option);
    });
}

// Search functionality
if (searchInput) {
    searchInput.addEventListener("input", () => {
        performSearch();
    });
}

if (searchFilterUser) {
    searchFilterUser.addEventListener("change", () => {
        performSearch();
    });
}

if (searchFilterDate) {
    searchFilterDate.addEventListener("change", () => {
        performSearch();
    });
}

// Navigation buttons
if (btnSearchPrev) {
    btnSearchPrev.addEventListener("click", () => {
        navigateSearch(-1);
    });
}

if (btnSearchNext) {
    btnSearchNext.addEventListener("click", () => {
        navigateSearch(1);
    });
}

function performSearch() {
    if (!searchInput || !allMessages) return;
    
    const query = searchInput.value.trim().toLowerCase();
    const selectedUserId = searchFilterUser ? searchFilterUser.value : "";
    const selectedDate = searchFilterDate ? searchFilterDate.value : "";
    
    // Clear previous highlights
    clearSearchHighlights();
    
    if (!query && !selectedUserId && !selectedDate) {
        clearSearchResults();
        return;
    }
    
    // Filter messages
    searchResults = allMessages.filter(msg => {
        // Filter by user
        if (selectedUserId && String(msg.sender_id) !== selectedUserId) {
            return false;
        }
        
        // Filter by date
        if (selectedDate) {
            const msgDate = new Date(msg.date);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            switch (selectedDate) {
                case "today":
                    if (msgDate < today) return false;
                    break;
                case "yesterday":
                    if (msgDate < yesterday || msgDate >= today) return false;
                    break;
                case "week":
                    if (msgDate < weekAgo) return false;
                    break;
                case "month":
                    if (msgDate < monthAgo) return false;
                    break;
            }
        }
        
        // Filter by content
        if (query) {
            const messageText = (msg.message || "").toLowerCase();
            const username = (msg.username || "").toLowerCase();
            const fileName = (msg.file_name || "").toLowerCase();
            
            if (!messageText.includes(query) && 
                !username.includes(query) && 
                !fileName.includes(query)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update results count
    if (searchResultsCount) {
        const count = searchResults.length;
        searchResultsCount.textContent = `${count} résultat${count > 1 ? 's' : ''}`;
    }
    
    // Enable/disable navigation buttons
    if (btnSearchPrev && btnSearchNext) {
        btnSearchPrev.disabled = searchResults.length === 0;
        btnSearchNext.disabled = searchResults.length === 0;
    }
    
    // Highlight results
    highlightSearchResults(query);
    
    // Navigate to first result
    if (searchResults.length > 0) {
        currentSearchIndex = 0;
        navigateToSearchResult(0);
    } else {
        currentSearchIndex = -1;
    }
}

function highlightSearchResults(query) {
    if (!query) return;
    
    const queryLower = query.toLowerCase();
    const messageElements = messagesContainer.querySelectorAll(".msg");
    
    messageElements.forEach(msgEl => {
        const msgId = msgEl.id.replace("msg-", "");
        const message = allMessages.find(m => String(m.id) === msgId);
        
        if (message && searchResults.some(r => String(r.id) === msgId)) {
            // Highlight this message
            msgEl.classList.add("search-result");
            
            // Highlight text in message
            const textDiv = msgEl.querySelector(".msg-text");
            if (textDiv && message.message) {
                const originalText = message.message;
                const highlightedText = originalText.replace(
                    new RegExp(`(${escapeRegex(query)})`, "gi"),
                    '<mark class="search-highlight">$1</mark>'
                );
                textDiv.innerHTML = highlightedText;
            }
        } else {
            msgEl.classList.remove("search-result");
        }
    });
}

function clearSearchHighlights() {
    const messageElements = messagesContainer.querySelectorAll(".msg");
    messageElements.forEach(msgEl => {
        msgEl.classList.remove("search-result");
        const textDiv = msgEl.querySelector(".msg-text");
        if (textDiv) {
            // Restore original text with mentions
            const msgId = msgEl.id.replace("msg-", "");
            const message = allMessages.find(m => String(m.id) === msgId);
            if (message && message.message) {
                let text = message.message;
                const mentionRegex = /@(\w+)/g;
                text = text.replace(mentionRegex, (match, username) => {
                    if (username === currentUser.username) {
                        return `<span class="mention highlight">${match}</span>`;
                    }
                    return `<span class="mention">${match}</span>`;
                });
                textDiv.innerHTML = text;
                
                // Add edited indicator if needed
                if (message.edited) {
                    const editedSpan = document.createElement("span");
                    editedSpan.className = "msg-edited";
                    editedSpan.textContent = " (modifié)";
                    textDiv.appendChild(editedSpan);
                }
            }
        }
    });
}

function clearSearchResults() {
    searchResults = [];
    currentSearchIndex = -1;
    if (searchResultsCount) {
        searchResultsCount.textContent = "0 résultat";
    }
    if (btnSearchPrev && btnSearchNext) {
        btnSearchPrev.disabled = true;
        btnSearchNext.disabled = true;
    }
    clearSearchHighlights();
}

function navigateSearch(direction) {
    if (searchResults.length === 0) return;
    
    currentSearchIndex += direction;
    
    if (currentSearchIndex < 0) {
        currentSearchIndex = searchResults.length - 1;
    } else if (currentSearchIndex >= searchResults.length) {
        currentSearchIndex = 0;
    }
    
    navigateToSearchResult(currentSearchIndex);
}

function navigateToSearchResult(index) {
    if (index < 0 || index >= searchResults.length) return;
    
    const result = searchResults[index];
    const msgElement = document.getElementById(`msg-${result.id}`);
    
    if (msgElement) {
        // Scroll to message
        msgElement.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Highlight temporarily
        msgElement.classList.add("search-result-active");
        setTimeout(() => {
            msgElement.classList.remove("search-result-active");
        }, 2000);
        
        // Update navigation info
        if (searchResultsCount) {
            searchResultsCount.textContent = `${index + 1} / ${searchResults.length}`;
        }
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- THEME MANAGEMENT ---

// Initialize theme from localStorage or system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icons
    if (themeIconSun && themeIconMoon) {
        if (theme === 'dark') {
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        } else {
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme on load
if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', toggleTheme);
    initTheme();
}

// --- NOTIFICATIONS ---

let notificationPermission = Notification.permission;
let notificationSound = null;

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission;
        });
    }
}

// Create notification sound
function createNotificationSound() {
    if (!notificationSound) {
        notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTQ8OUKjj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU0PDlCo4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
        notificationSound.volume = 0.5;
    }
    return notificationSound;
}

// Send browser notification
function sendNotification(title, body, icon = null) {
    if (!('Notification' in window)) return;
    
    if (notificationPermission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'chat-notification',
            requireInteraction: false
        });
        
        // Play sound
        const sound = createNotificationSound();
        if (sound) {
            sound.play().catch(e => console.log('Could not play notification sound:', e));
        }
        
        // Update badge if supported
        if ('setAppBadge' in navigator) {
            navigator.setAppBadge().catch(e => console.log('Could not set badge:', e));
        }
        
        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

// Clear badge
function clearNotificationBadge() {
    if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(e => console.log('Could not clear badge:', e));
    }
}

// Request permission on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', requestNotificationPermission);
} else {
    requestNotificationPermission();
}

// Clear badge when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        clearNotificationBadge();
    }
});

// --- USER STATUS MANAGEMENT ---

// Track user activity for idle status
let idleTimeout = null;
let lastActivityTime = Date.now();
const IDLE_TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Reset idle timer on user activity
function resetIdleTimer() {
    lastActivityTime = Date.now();
    
    // Clear existing timeout
    if (idleTimeout) {
        clearTimeout(idleTimeout);
        idleTimeout = null;
    }
    
    // If user is online, set up new idle timeout
    if (currentUser && currentUser.status === 'online') {
        idleTimeout = setTimeout(() => {
            // Only set to idle if still online and no recent activity
            if (currentUser && currentUser.status === 'online' && 
                Date.now() - lastActivityTime >= IDLE_TIME_THRESHOLD) {
                updateUserStatus('idle');
            }
        }, IDLE_TIME_THRESHOLD);
    }
}

// Update user status (can accept user object or status string)
function updateUserStatus(statusOrUser) {
    if (!currentUser) return;
    
    // Handle both cases: updateUserStatus(user) or updateUserStatus('online')
    let status;
    if (typeof statusOrUser === 'string') {
        status = statusOrUser;
    } else if (statusOrUser && statusOrUser.status) {
        // It's a user object, just update the UI
        status = statusOrUser.status;
        if (userStatusIndicator) {
            userStatusIndicator.className = `status-indicator ${status}`;
        }
        return;
    } else {
        return;
    }
    
    // Don't update if status hasn't changed
    if (currentUser.status === status) {
        return;
    }
    
    // Get token from localStorage or currentUser
    const token = localStorage.getItem('chat_token') || (currentUser && currentUser.token);
    
    if (!token) {
        console.error('No token available');
        return;
    }
    
    // Normalize 'away' to 'idle' for consistency
    if (status === 'away') {
        status = 'idle';
    }
    
    fetch(`${API_BASE_URL}/api/user/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    }).then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.error || `HTTP ${res.status}`);
            });
        }
        return res.json();
    })
    .then(data => {
        if (data.status) {
            currentUser.status = data.status;
            
            // Update UI
            if (userStatusIndicator) {
                userStatusIndicator.className = `status-indicator ${data.status}`;
            }
            
            // Update profile status display if modal is open
            if (profileStatusDisplay) {
                profileStatusDisplay.className = `status-indicator profile-status-indicator ${data.status}`;
            }
            
            // Reset idle timer if status changed to online
            if (data.status === 'online') {
                resetIdleTimer();
            } else {
                // Clear idle timer if status changed away from online
                if (idleTimeout) {
                    clearTimeout(idleTimeout);
                    idleTimeout = null;
                }
            }
            
            // Emit socket event (server will also broadcast, but this ensures consistency)
            socket.emit('user_status_update', { userId: currentUser.id, status: data.status });
        }
    }).catch(err => {
        console.error('Error updating status:', err);
        // Show user-friendly error
        if (err.message.includes('Statut invalide')) {
            alert('Statut invalide. Veuillez choisir un statut valide.');
        }
    });
}

// Show status selector
function showStatusSelector() {
    const statuses = [
        { value: 'online', label: 'En ligne', color: '#10b981' },
        { value: 'idle', label: 'Absent', color: '#f59e0b' },
        { value: 'dnd', label: 'Ne pas déranger', color: '#ef4444' },
        { value: 'invisible', label: 'Invisible', color: '#6b7280' },
        { value: 'offline', label: 'Hors ligne', color: '#6b7280' }
    ];
    
    // Create status menu
    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.innerHTML = statuses.map(s => `
        <div class="status-option" data-status="${s.value}">
            <div class="status-indicator ${s.value}" style="background-color: ${s.color}"></div>
            <span>${s.label}</span>
        </div>
    `).join('');
    
    // Add click handlers
    menu.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', () => {
            const status = option.dataset.status;
            updateUserStatus(status);
            menu.remove();
        });
    });
    
    // Position and show menu
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        const rect = userProfile.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;
        menu.style.zIndex = '1000';
        document.body.appendChild(menu);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !userProfile.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }
}

// --- PINNED MESSAGES ---

// Toggle pinned messages panel
if (btnPinnedMessages) {
    btnPinnedMessages.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!pinnedMessagesPanel) {
            console.error('Pinned messages panel not found');
            return;
        }
        pinnedMessagesPanel.classList.toggle('hidden');
        if (!pinnedMessagesPanel.classList.contains('hidden')) {
            loadPinnedMessages();
        }
    });
} else {
    console.error('btn-pinned-messages button not found');
}

if (btnClosePinned) {
    btnClosePinned.addEventListener('click', () => {
        pinnedMessagesPanel.classList.add('hidden');
    });
}

// Load pinned messages
function loadPinnedMessages() {
    if (!currentChannel && !currentRecipient) {
        console.log('No channel or recipient selected');
        return;
    }
    
    if (!currentUser) {
        console.error('No current user');
        return;
    }
    
    const context = currentChannel 
        ? { channelId: currentChannel.id } 
        : { recipientId: currentRecipient.id, myId: currentUser.id };
    
    console.log('Loading pinned messages with context:', context);
    socket.emit('get_pinned_messages', context);
}

// Display pinned message
function displayPinnedMessage(msg) {
    const div = document.createElement('div');
    div.className = 'pinned-message-item';
    div.innerHTML = `
        <div class="pinned-message-header">
            <span class="pinned-message-author">${msg.username}</span>
            <span class="pinned-message-date">${new Date(msg.date).toLocaleDateString()}</span>
        </div>
        <div class="pinned-message-content">${msg.message || '[Fichier]'}</div>
        <button class="pinned-message-jump" data-msg-id="${msg.id}">Aller au message</button>
    `;
    
    div.querySelector('.pinned-message-jump').addEventListener('click', () => {
        const msgElement = document.getElementById(`msg-${msg.id}`);
        if (msgElement) {
            msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgElement.classList.add('highlight-message');
            setTimeout(() => {
                msgElement.classList.remove('highlight-message');
            }, 2000);
        }
        pinnedMessagesPanel.classList.add('hidden');
    });
    
    return div;
}

// Socket events for status and pinned messages
socket.on('user_status_updated', (data) => {
    // Update status in UI - find all status indicators for this user
    const statusIndicators = document.querySelectorAll(`.status-indicator[data-user-id="${data.userId}"]`);
    statusIndicators.forEach(indicator => {
        // For invisible users, show as offline to others
        const displayStatus = data.status === 'invisible' && data.userId !== currentUser.id ? 'offline' : data.status;
        indicator.className = `status-indicator ${displayStatus}`;
    });
    
    // Also update status indicators in messages by finding messages from this user
    const messageElements = document.querySelectorAll(`.msg`);
    messageElements.forEach(msgEl => {
        const statusIndicator = msgEl.querySelector(`.status-indicator[data-user-id="${data.userId}"]`);
        if (statusIndicator) {
            const displayStatus = data.status === 'invisible' && data.userId !== currentUser.id ? 'offline' : data.status;
            statusIndicator.className = `status-indicator ${displayStatus}`;
        }
    });
    
    // Update in users list
    const user = users.find(u => u.id === data.userId);
    if (user) {
        user.status = data.status;
        renderUsers();
    }
    
    // Update channel members list if visible
    if (channelMembersList && !channelMembersList.classList.contains('hidden')) {
        renderChannelMembers();
    }
});

// Toggle pin message
function togglePinMessage(messageId, isPinned) {
    const endpoint = isPinned ? '/api/messages/unpin' : '/api/messages/pin';
    
    // Get token from localStorage or currentUser
    const token = localStorage.getItem('chat_token') || (currentUser && currentUser.token);
    
    if (!token) {
        alert('Vous devez être connecté pour épingler un message');
        return;
    }
    
    fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId })
    }).then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.error || 'Erreur lors de l\'épinglage');
            });
        }
        return res.json();
    })
    .then(data => {
        if (data.success) {
            // Update message in allMessages array
            const messageIndex = allMessages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                allMessages[messageIndex].pinned = !isPinned;
            }
            
            // Update message in UI
            const msgElement = document.getElementById(`msg-${messageId}`);
            if (msgElement) {
                const pinIndicator = msgElement.querySelector('.msg-pinned-indicator');
                // Find the pin button specifically using data attribute
                const actionsDiv = msgElement.querySelector('.msg-actions');
                const pinBtn = actionsDiv ? actionsDiv.querySelector('button[data-pin-btn="true"]') : null;
                
                if (isPinned) {
                    // Unpinning: remove indicator, update button
                    if (pinIndicator) pinIndicator.remove();
                    if (pinBtn) {
                        pinBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                        `;
                        pinBtn.title = "Épingler";
                    }
                } else {
                    // Pinning: add indicator, update button
                    const content = msgElement.querySelector('.msg-content');
                    if (content && !pinIndicator) {
                        const newPinIndicator = document.createElement("div");
                        newPinIndicator.className = "msg-pinned-indicator";
                        newPinIndicator.innerHTML = `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                            Épinglé
                        `;
                        content.insertBefore(newPinIndicator, content.firstChild);
                    }
                    if (pinBtn) {
                        pinBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                        `;
                        pinBtn.title = "Désépingler";
                    }
                }
            }
            
            // Reload pinned messages if panel is open
            if (pinnedMessagesPanel && !pinnedMessagesPanel.classList.contains('hidden')) {
                loadPinnedMessages();
            }
        }
    }).catch(err => {
        console.error('Error toggling pin:', err);
        alert('Erreur: ' + err.message);
    });
}

socket.on('pinned_messages', (messages) => {
    console.log('Received pinned messages:', messages);
    if (!pinnedMessagesList) {
        console.error('pinned-messages-list element not found');
        return;
    }
    
    pinnedMessagesList.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        pinnedMessagesList.innerHTML = '<div class="no-pinned-messages">Aucun message épinglé</div>';
        return;
    }
    
    messages.forEach(msg => {
        pinnedMessagesList.appendChild(displayPinnedMessage(msg));
    });
});

socket.on('message_pinned', (data) => {
    const msgElement = document.getElementById(`msg-${data.messageId}`);
    if (msgElement) {
        // Reload message or update UI
        if (data.pinned) {
            // Message was pinned - add indicator
            const content = msgElement.querySelector('.msg-content');
            if (content && !content.querySelector('.msg-pinned-indicator')) {
                const pinIndicator = document.createElement("div");
                pinIndicator.className = "msg-pinned-indicator";
                pinIndicator.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="6" y1="3" x2="6" y2="15"></line>
                        <circle cx="18" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                    </svg>
                    Épinglé
                `;
                content.insertBefore(pinIndicator, content.firstChild);
            }
        } else {
            // Message was unpinned - remove indicator
            const pinIndicator = msgElement.querySelector('.msg-pinned-indicator');
            if (pinIndicator) pinIndicator.remove();
        }
    }
    
    // Reload pinned messages if panel is open
    if (pinnedMessagesPanel && !pinnedMessagesPanel.classList.contains('hidden')) {
        loadPinnedMessages();
    }
});

// Update status on page visibility change (Discord-style)
document.addEventListener('visibilitychange', () => {
    if (!currentUser) return;
    
    // Don't change status if user has invisible or offline set manually
    if (currentUser.status === 'invisible' || currentUser.status === 'offline') {
        return;
    }
    
    if (document.hidden) {
        // Set to idle when tab is hidden (unless already dnd)
        if (currentUser.status !== 'dnd') {
            updateUserStatus('idle');
        }
    } else {
        // Set back to online when tab becomes visible (unless dnd or invisible)
        if (currentUser.status === 'idle' || currentUser.status === 'offline') {
            updateUserStatus('online');
            resetIdleTimer();
        }
    }
});

// Update status on page unload
window.addEventListener('beforeunload', () => {
    if (!currentUser) return;
    
    // Only set to offline if not invisible (invisible users stay invisible)
    if (currentUser.status !== 'invisible') {
        updateUserStatus('offline');
    }
    
    if (isInVoiceChannel) {
        leaveVoiceChannel();
    }
});

// Track user activity to reset idle timer (Discord-style)
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetIdleTimer, { passive: true });
});

// Initialize idle timer on login
if (currentUser && currentUser.status === 'online') {
    resetIdleTimer();
}

// --- VOICE CHANNEL MANAGEMENT (WebRTC Native) ---

let currentVoiceChannel = null;
let isInVoiceChannel = false;
let voiceParticipants = new Map(); // userId -> { userId, username, muted, deafened, speaking, peerConnection, screenSharing, screenStream }
let isMuted = false;
let isDeafened = false;
let localStream = null;
let screenStream = null; // Stream for screen sharing
let isScreenSharing = false;
let peerConnections = new Map(); // userId -> RTCPeerConnection
let screenShareTracks = new Map(); // userId -> MediaStreamTrack (for receiving screen shares)
let activeScreenShares = new Map(); // userId -> { userId, username, stream, videoElement, isLocal }
let screenSharePeerConnections = new Map(); // userId -> RTCPeerConnection (for screen sharing)
let currentScreenShareUserId = null; // Currently displayed screen share userId
let screenShareViewMode = 'users'; // 'users' or 'screen-share'

// REMOVED: All mediasoup functions - now using WebRTC native
// The following functions have been removed:
// - waitForMediasoup()
// - loadMediasoupFromLocalServer()
// - loadMediasoupDynamically()
// All voice functionality now uses WebRTC native APIs (navigator.mediaDevices.getUserMedia, RTCPeerConnection, etc.)

// REMOVED: All mediasoup code - using WebRTC native only

// Join voice channel (WebRTC Native)
async function joinVoiceChannel(channel) {
    console.log('joinVoiceChannel called with:', channel);
    
    if (!currentUser) {
        alert('Vous devez être connecté pour rejoindre un canal vocal');
        return;
    }
    
    if (isInVoiceChannel) {
        if (confirm('Vous êtes déjà dans un canal vocal. Voulez-vous le quitter ?')) {
            await leaveVoiceChannel();
        } else {
            return;
        }
    }
    
    try {
        currentVoiceChannel = channel;
        const roomId = `channel_${channel.id}`;
        console.log('Joining voice room:', roomId);
        
        // Get user media (microphone)
        // Request microphone access with constraints from settings
        localStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                deviceId: voiceSettings.inputDeviceId ? { exact: voiceSettings.inputDeviceId } : undefined,
                sampleRate: 48000,
                channelCount: 1
            } 
        });
        
        // Apply volume settings
        if (localStream) {
            applyInputVolume();
            applyOutputVolume();
        }
        
        console.log('Got user media stream');
        
        // Join voice room via socket
        socket.emit('joinVoiceRoom', { roomId, userId: currentUser.id });
        
        // Add current user to participants
        voiceParticipants.set(currentUser.id, {
            userId: currentUser.id,
            username: currentUser.username,
            muted: isMuted,
            deafened: isDeafened,
            speaking: false,
            peerConnection: null
        });
        
        isInVoiceChannel = true;
        updateVoiceUI(true);
        
        console.log('Successfully joined voice channel');
        
    } catch (error) {
        console.error('Error joining voice channel:', error);
        alert('Erreur lors de la connexion au canal vocal: ' + (error.message || 'Erreur inconnue. Vérifiez la console pour plus de détails.'));
        currentVoiceChannel = null;
        isInVoiceChannel = false;
        updateVoiceUI(false);
        
        // Clean up stream if it was created
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
    }
}

// WebRTC: Handle remote audio stream (simplified - no consumer needed)
// Audio streams are handled directly through peer connections

// Leave voice channel (WebRTC Native)
async function leaveVoiceChannel() {
    if (!isInVoiceChannel) return;
    
    try {
        const roomId = `channel_${currentVoiceChannel.id}`;
        
        // Stop screen share if active
        if (isScreenSharing) {
            stopScreenShare();
        }
        
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        
        // Stop screen stream
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            screenStream = null;
        }
        
        // Close all peer connections
        peerConnections.forEach((pc, userId) => {
            try {
                pc.close();
            } catch (e) {
                console.warn('Error closing peer connection:', e);
            }
        });
        peerConnections.clear();
        
        // Close all screen share peer connections
        screenSharePeerConnections.forEach((pc, userId) => {
            try {
                pc.close();
            } catch (e) {
                console.warn('Error closing screen share peer connection:', e);
            }
        });
        screenSharePeerConnections.clear();
        
        // Clear active screen shares
        activeScreenShares.clear();
        
        // Reset screen share view mode
        screenShareViewMode = 'users';
        currentScreenShareUserId = null;
        
        // Leave room
        socket.emit('leaveVoiceRoom', {
            roomId,
            userId: currentUser.id,
        });
        
        // Update channel participants map before leaving
        const channelId = currentVoiceChannel ? currentVoiceChannel.id : null;
        
        isInVoiceChannel = false;
        currentVoiceChannel = null;
        isMuted = false;
        isDeafened = false;
        voiceParticipants.clear();
        
        // Update channel participants map
        if (channelId && voiceChannelParticipants.has(channelId)) {
            voiceChannelParticipants.get(channelId).delete(currentUser.id);
        }
        
        // Stop microphone test if modal is open
        const modal = document.getElementById('voice-settings-modal');
        if (modal && !modal.classList.contains('hidden')) {
            stopMicrophoneTest();
        }
        
        updateVoiceUI(false);
        renderChannels(); // Update channel list
        
        console.log('Left voice channel successfully');
        
    } catch (error) {
        console.error('Error leaving voice channel:', error);
    }
}

// Toggle microphone mute (WebRTC Native)
function toggleVoiceMute() {
    if (!isInVoiceChannel || !localStream) return;
    
    isMuted = !isMuted;
    
    // Update local audio tracks
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted && !isDeafened;
    });
    
    // Update UI
    updateVoiceControlsBar();
    
    // Update participant status
    if (currentUser) {
        const participant = voiceParticipants.get(currentUser.id);
        if (participant) {
            participant.muted = isMuted;
            updateVoiceParticipantsList();
            updateVoiceChannelGrid(); // Update main grid view
        }
    }
    
    // Broadcast mute status
    socket.emit('voice_mute_status', {
        userId: currentUser.id,
        roomId: `channel_${currentVoiceChannel.id}`,
        muted: isMuted
    });
    
    console.log('Microphone', isMuted ? 'muted' : 'unmuted');
}

// Toggle deafen (sourd) - WebRTC Native
function toggleVoiceDeafen() {
    if (!isInVoiceChannel || !localStream) return;
    
    isDeafened = !isDeafened;
    
    // When deafened, also mute (like Discord)
    if (isDeafened) {
        isMuted = true;
    }
    
    // Update local audio tracks
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted && !isDeafened;
    });
    
    // Mute/unmute all peer connection audio
    peerConnections.forEach((pc, userId) => {
        // Audio is handled through peer connections
        // We can mute remote audio by controlling the audio elements
    });
    
    // Update UI
    updateVoiceControlsBar();
    
    // Update participant status
    if (currentUser) {
        const participant = voiceParticipants.get(currentUser.id);
        if (participant) {
            participant.muted = isMuted;
            participant.deafened = isDeafened;
            updateVoiceParticipantsList();
            updateVoiceChannelGrid(); // Update main grid view
        }
    }
    
    // Broadcast deafen status
    socket.emit('voice_deafen_status', {
        userId: currentUser.id,
        roomId: `channel_${currentVoiceChannel.id}`,
        deafened: isDeafened
    });
    
    console.log('Deafen', isDeafened ? 'enabled' : 'disabled');
}

// Toggle screen sharing
async function toggleScreenShare() {
    if (!isInVoiceChannel || !currentVoiceChannel) {
        alert('Vous devez être dans un canal vocal pour partager votre écran');
        return;
    }
    
    if (isScreenSharing) {
        stopScreenShare();
    } else {
        await startScreenShare();
    }
}

// Start screen sharing
async function startScreenShare() {
    if (!isInVoiceChannel || !currentVoiceChannel) return;
    
    try {
        // Request screen share
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always',
                displaySurface: 'monitor'
            },
            audio: true // Try to capture system audio if available
        });
        
        console.log('Screen share started');
        isScreenSharing = true;
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            stopScreenShare();
        });
        
        // Store active screen share first
        activeScreenShares.set(currentUser.id, {
            userId: currentUser.id,
            username: currentUser.username,
            stream: screenStream,
            videoElement: document.getElementById('screen-share-video'),
            isLocal: true,
            user: currentUser
        });
        
        // Show local screen share (will switch to screen share view)
        showScreenShare(currentUser.id, currentUser.username, screenStream, true);
        
        // Update participant status
        if (currentUser) {
            const participant = voiceParticipants.get(currentUser.id);
            if (participant) {
                participant.screenSharing = true;
                participant.screenStream = screenStream;
                updateVoiceParticipantsList();
                updateVoiceChannelGrid();
            }
        }
        
        // Broadcast screen share start
        socket.emit('screen_share_start', {
            userId: currentUser.id,
            roomId: `channel_${currentVoiceChannel.id}`,
            channelId: currentVoiceChannel.id
        });
        
        // Update UI buttons
        updateScreenShareButtons();
        
        // Start WebRTC transmission to other participants
        startScreenShareTransmission();
        
    } catch (error) {
        console.error('Error starting screen share:', error);
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
            alert('Erreur lors du démarrage du partage d\'écran: ' + error.message);
        }
        isScreenSharing = false;
    }
}

// Stop screen sharing
function stopScreenShare() {
    if (!isScreenSharing) return;
    
    try {
        // Stop screen stream
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            screenStream = null;
        }
        
        // Remove from active screen shares
        activeScreenShares.delete(currentUser.id);
        
        // Stop WebRTC transmission
        stopScreenShareTransmission();
        
        // Hide screen share display if it's ours
        const activeShare = activeScreenShares.get(currentUser.id);
        if (activeShare && activeShare.isLocal) {
            hideScreenShare();
        }
        
        // Update participant status
        if (currentUser) {
            const participant = voiceParticipants.get(currentUser.id);
            if (participant) {
                participant.screenSharing = false;
                participant.screenStream = null;
                updateVoiceParticipantsList();
                updateVoiceChannelGrid();
            }
        }
        
        // Broadcast screen share stop
        if (currentVoiceChannel) {
            socket.emit('screen_share_stop', {
                userId: currentUser.id,
                roomId: `channel_${currentVoiceChannel.id}`,
                channelId: currentVoiceChannel.id
            });
        }
        
        isScreenSharing = false;
        
        // Update UI buttons
        updateScreenShareButtons();
        
        console.log('Screen share stopped');
        
    } catch (error) {
        console.error('Error stopping screen share:', error);
    }
}

// Show screen share (local or remote) - Discord style
function showScreenShare(userId, username, stream, isLocal = false) {
    const container = document.getElementById('screen-share-container');
    const video = document.getElementById('screen-share-video');
    const userName = document.getElementById('screen-share-user-name');
    const screenShareStatus = document.getElementById('screen-share-status');
    const screenShareAvatar = document.getElementById('screen-share-avatar');
    const stopBtn = document.getElementById('btn-stop-screen-share');
    const fullscreenBtn = document.getElementById('btn-screen-share-fullscreen');
    const loading = document.getElementById('screen-share-loading');
    const overlay = document.querySelector('.screen-share-overlay');
    
    if (!container || !video) return;
    
    // Set current screen share
    currentScreenShareUserId = userId;
    screenShareViewMode = 'screen-share';
    
    // Hide loading after a moment
    if (loading && overlay) {
        setTimeout(() => {
            loading.classList.add('hidden');
            overlay.classList.add('hidden');
        }, 500);
    }
    
    // Set video source
    video.srcObject = stream;
    
    // Update user info
    const user = users.find(u => u.id === userId) || { username, avatar: null, avatar_color: null };
    
    if (userName) {
        userName.textContent = user.username;
    }
    
    if (screenShareStatus) {
        if (isLocal) {
            screenShareStatus.textContent = 'Vous partagez votre écran';
        } else {
            screenShareStatus.textContent = 'Partage son écran';
        }
    }
    
    // Update avatar
    if (screenShareAvatar) {
        updateAvatarElement(screenShareAvatar, user.avatar, user.username, user.avatar_color);
    }
    
    // Show stop button only if it's our own screen share
    if (stopBtn) {
        if (isLocal) {
            stopBtn.classList.remove('hidden');
            stopBtn.onclick = stopScreenShare;
        } else {
            stopBtn.classList.add('hidden');
        }
    }
    
    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.onclick = () => {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            }
        };
    }
    
    // Handle video events
    video.onloadedmetadata = () => {
        if (loading) loading.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        video.play().catch(e => console.error('Error playing video:', e));
    };
    
    video.onerror = () => {
        console.error('Error loading screen share video');
        if (loading) loading.classList.remove('hidden');
        if (overlay) overlay.classList.remove('hidden');
    };
    
    // Update screen share switcher
    updateScreenShareSwitcher();
    
    // Show container and hide grid
    container.classList.remove('hidden');
    const grid = document.getElementById('voice-channel-grid');
    if (grid) {
        grid.classList.add('hidden');
    }
    const empty = document.getElementById('voice-channel-empty');
    if (empty) {
        empty.classList.add('hidden');
    }
}

// Hide screen share
function hideScreenShare() {
    const container = document.getElementById('screen-share-container');
    const video = document.getElementById('screen-share-video');
    
    if (container) {
        container.classList.add('hidden');
    }
    
    if (video) {
        video.srcObject = null;
        video.pause();
    }
    
    currentScreenShareUserId = null;
    
    // Show grid again if no other screen shares
    if (activeScreenShares.size === 0) {
        screenShareViewMode = 'users';
        showUsersView();
    } else {
        // Show next available screen share
        const nextShare = Array.from(activeScreenShares.values())[0];
        if (nextShare) {
            showScreenShare(nextShare.userId, nextShare.username, nextShare.stream, nextShare.isLocal);
        }
    }
}

// Show users view (back to grid)
function showUsersView() {
    screenShareViewMode = 'users';
    const container = document.getElementById('screen-share-container');
    const grid = document.getElementById('voice-channel-grid');
    const empty = document.getElementById('voice-channel-empty');
    
    if (container) {
        container.classList.add('hidden');
    }
    
    if (grid) {
        grid.classList.remove('hidden');
    }
    
    // Show empty if no participants
    if (empty && voiceParticipants.size === 0) {
        empty.classList.remove('hidden');
    } else if (empty) {
        empty.classList.add('hidden');
    }
}

// Update screen share switcher
function updateScreenShareSwitcher() {
    const switcher = document.getElementById('screen-share-switcher');
    const counter = document.getElementById('screen-share-counter');
    const prevBtn = document.getElementById('btn-prev-screen-share');
    const nextBtn = document.getElementById('btn-next-screen-share');
    
    if (!switcher || !counter) return;
    
    const shareCount = activeScreenShares.size;
    
    if (shareCount > 1) {
        switcher.classList.remove('hidden');
        const currentIndex = Array.from(activeScreenShares.keys()).indexOf(currentScreenShareUserId) + 1;
        counter.textContent = `${currentIndex} / ${shareCount}`;
        
        // Enable/disable navigation buttons
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 1;
            prevBtn.onclick = () => switchToPreviousScreenShare();
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentIndex === shareCount;
            nextBtn.onclick = () => switchToNextScreenShare();
        }
    } else {
        switcher.classList.add('hidden');
    }
}

// Switch to previous screen share
function switchToPreviousScreenShare() {
    const shares = Array.from(activeScreenShares.entries());
    const currentIndex = shares.findIndex(([userId]) => userId === currentScreenShareUserId);
    
    if (currentIndex > 0) {
        const [userId, share] = shares[currentIndex - 1];
        showScreenShare(userId, share.username, share.stream, share.isLocal);
    }
}

// Switch to next screen share
function switchToNextScreenShare() {
    const shares = Array.from(activeScreenShares.entries());
    const currentIndex = shares.findIndex(([userId]) => userId === currentScreenShareUserId);
    
    if (currentIndex < shares.length - 1) {
        const [userId, share] = shares[currentIndex + 1];
        showScreenShare(userId, share.username, share.stream, share.isLocal);
    }
}

// Start WebRTC transmission for screen sharing
async function startScreenShareTransmission() {
    if (!screenStream || !currentVoiceChannel) return;
    
    // For each participant, create a peer connection to send screen share
    voiceParticipants.forEach(async (participant, userId) => {
        if (userId === currentUser.id) return; // Skip self
        
        try {
            // Create peer connection for screen sharing
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            // Add screen share track
            screenStream.getTracks().forEach(track => {
                pc.addTrack(track, screenStream);
            });
            
            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('screen_share_ice_candidate', {
                        userId: currentUser.id,
                        targetUserId: userId,
                        candidate: event.candidate,
                        roomId: `channel_${currentVoiceChannel.id}`
                    });
                }
            };
            
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            // Send offer via socket
            socket.emit('screen_share_offer', {
                userId: currentUser.id,
                targetUserId: userId,
                offer: offer,
                roomId: `channel_${currentVoiceChannel.id}`
            });
            
            screenSharePeerConnections.set(userId, pc);
            
        } catch (error) {
            console.error('Error creating screen share peer connection:', error);
        }
    });
}

// Stop WebRTC transmission for screen sharing
function stopScreenShareTransmission() {
    screenSharePeerConnections.forEach((pc, userId) => {
        try {
            pc.close();
        } catch (e) {
            console.error('Error closing screen share peer connection:', e);
        }
    });
    screenSharePeerConnections.clear();
}

// Handle incoming screen share offer
async function handleScreenShareOffer(data) {
    const { userId, offer } = data;
    
    try {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
        
        // Handle incoming track
        pc.ontrack = (event) => {
            const stream = event.streams[0];
            if (stream) {
                const user = users.find(u => u.id === userId);
                const username = user?.username || `User ${userId}`;
                
                // Store active screen share
                activeScreenShares.set(userId, {
                    userId,
                    username,
                    stream,
                    videoElement: document.getElementById('screen-share-video'),
                    isLocal: false,
                    user: user
                });
                
                // Show screen share (will switch view automatically if we were waiting)
                // If we're already showing this user's screen share (loading state), it will update
                // Otherwise, if we're in users view, it will switch to screen share view
                if (currentScreenShareUserId === userId || screenShareViewMode === 'screen-share') {
                    showScreenShare(userId, username, stream, false);
                }
            }
        };
        
        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('screen_share_ice_candidate', {
                    userId: currentUser.id,
                    targetUserId: userId,
                    candidate: event.candidate,
                    roomId: `channel_${currentVoiceChannel.id}`
                });
            }
        };
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Send answer
        socket.emit('screen_share_answer', {
            userId: currentUser.id,
            targetUserId: userId,
            answer: answer,
            roomId: `channel_${currentVoiceChannel.id}`
        });
        
        screenSharePeerConnections.set(userId, pc);
        
    } catch (error) {
        console.error('Error handling screen share offer:', error);
    }
}

// Handle incoming screen share answer
async function handleScreenShareAnswer(data) {
    const { userId, answer } = data;
    const pc = screenSharePeerConnections.get(userId);
    
    if (pc) {
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error setting remote description:', error);
        }
    }
}

// Handle ICE candidate for screen sharing
function handleScreenShareIceCandidate(data) {
    const { userId, candidate } = data;
    const pc = screenSharePeerConnections.get(userId);
    
    if (pc && candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {
            console.error('Error adding ICE candidate:', e);
        });
    }
}

// Update screen share buttons
function updateScreenShareButtons() {
    const screenShareBtn = document.getElementById('btn-voice-screen-share');
    const screenShareBtnMain = document.getElementById('btn-voice-screen-share');
    
    [screenShareBtn, screenShareBtnMain].forEach(btn => {
        if (btn) {
            if (isScreenSharing) {
                btn.classList.add('active');
                btn.title = 'Arrêter le partage d\'écran';
            } else {
                btn.classList.remove('active');
                btn.title = 'Partager l\'écran';
            }
        }
    });
}

// Voice settings state
let voiceSettings = {
    inputDeviceId: null,
    outputDeviceId: null,
    inputVolume: 100,
    outputVolume: 100
};

// Store participants per voice channel
let voiceChannelParticipants = new Map(); // channelId -> Set of userIds

// Load voice settings from localStorage
function loadVoiceSettings() {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
        try {
            voiceSettings = { ...voiceSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Failed to load voice settings:', e);
        }
    }
}

// Save voice settings to localStorage
function saveVoiceSettings() {
    localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
}

// Initialize voice control buttons
function initializeVoiceControls() {
    loadVoiceSettings();
    
    const muteBtn = document.getElementById('btn-voice-mute');
    const deafenBtn = document.getElementById('btn-voice-deafen');
    const leaveBtn = document.getElementById('btn-voice-leave');
    const settingsBtn = document.getElementById('btn-voice-settings');
    const muteBtnMain = document.getElementById('btn-voice-mute-main');
    const deafenBtnMain = document.getElementById('btn-voice-deafen-main');
    const leaveBtnMain = document.getElementById('btn-voice-leave-main');
    const settingsBtnMain = document.getElementById('btn-voice-settings-main');
    const screenShareBtn = document.getElementById('btn-voice-screen-share');
    const inviteBtn = document.getElementById('btn-voice-invite');
    const voiceMenuToggle = document.getElementById('voice-menu-toggle');
    
    // Bottom bar controls
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleVoiceMute);
    }
    
    if (deafenBtn) {
        deafenBtn.addEventListener('click', toggleVoiceDeafen);
    }
    
    if (leaveBtn) {
        leaveBtn.addEventListener('click', leaveVoiceChannel);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showVoiceSettings);
    }
    
    // Main view controls
    if (muteBtnMain) {
        muteBtnMain.addEventListener('click', toggleVoiceMute);
    }
    
    if (deafenBtnMain) {
        deafenBtnMain.addEventListener('click', toggleVoiceDeafen);
    }
    
    if (leaveBtnMain) {
        leaveBtnMain.addEventListener('click', leaveVoiceChannel);
    }
    
    if (settingsBtnMain) {
        settingsBtnMain.addEventListener('click', showVoiceSettings);
    }
    
    // Bottom bar settings button
    const settingsBtnControls = document.getElementById('btn-voice-settings-controls');
    if (settingsBtnControls) {
        settingsBtnControls.addEventListener('click', showVoiceSettings);
    }
    
    if (screenShareBtn) {
        screenShareBtn.addEventListener('click', toggleScreenShare);
    }
    
    // Main view screen share button
    const screenShareBtnMain = document.getElementById('btn-voice-screen-share');
    if (screenShareBtnMain) {
        screenShareBtnMain.addEventListener('click', toggleScreenShare);
    }
    
    // Back to users button
    const backToUsersBtn = document.getElementById('btn-back-to-users');
    if (backToUsersBtn) {
        backToUsersBtn.addEventListener('click', showUsersView);
    }
    
    if (inviteBtn) {
        inviteBtn.addEventListener('click', () => {
            // TODO: Show invite modal
            console.log('Invite clicked');
            alert('Invitation à venir');
        });
    }
    
    if (voiceMenuToggle) {
        voiceMenuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
    }
    
    // Sync theme toggle with main one
    const themeToggleVoice = document.getElementById('btn-theme-toggle-voice');
    const themeToggle = document.getElementById('btn-theme-toggle');
    if (themeToggleVoice && themeToggle) {
        themeToggleVoice.addEventListener('click', () => {
            themeToggle.click();
        });
    }
    
    // Initialize voice settings modal
    initializeVoiceSettingsModal();
}

// Initialize voice settings modal
function initializeVoiceSettingsModal() {
    const modal = document.getElementById('voice-settings-modal');
    const closeBtn = document.getElementById('btn-close-voice-settings');
    const saveBtn = document.getElementById('btn-save-voice-settings');
    const resetBtn = document.getElementById('btn-reset-voice-settings');
    const inputDeviceSelect = document.getElementById('input-device-select');
    const outputDeviceSelect = document.getElementById('output-device-select');
    const inputVolumeSlider = document.getElementById('input-volume-slider');
    const outputVolumeSlider = document.getElementById('output-volume-slider');
    const inputVolumeValue = document.getElementById('input-volume-value');
    const outputVolumeValue = document.getElementById('output-volume-value');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('hidden');
                stopMicrophoneTest(); // Stop test when closing modal
            }
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveVoiceSettingsFromModal();
            if (modal) {
                modal.classList.add('hidden');
                stopMicrophoneTest(); // Stop test when closing modal
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetVoiceSettings();
        });
    }
    
    if (inputVolumeSlider && inputVolumeValue) {
        inputVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            inputVolumeValue.textContent = `${value}%`;
            voiceSettings.inputVolume = parseInt(value);
            applyInputVolume();
        });
    }
    
    if (outputVolumeSlider && outputVolumeValue) {
        outputVolumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            outputVolumeValue.textContent = `${value}%`;
            voiceSettings.outputVolume = parseInt(value);
            applyOutputVolume();
        });
    }
    
    // Device selection handlers (already declared above, just add event listeners)
    if (inputDeviceSelect) {
        inputDeviceSelect.addEventListener('change', async (e) => {
            voiceSettings.inputDeviceId = e.target.value || null;
            saveVoiceSettings();
            // Reconnect with new device if in voice channel
            if (isInVoiceChannel && currentVoiceChannel) {
                await reconnectWithNewDevice();
            }
        });
    }
    
    if (outputDeviceSelect) {
        outputDeviceSelect.addEventListener('change', (e) => {
            voiceSettings.outputDeviceId = e.target.value || null;
            saveVoiceSettings();
            applyOutputVolume();
        });
    }
    
    // Test microphone button
    const testMicBtn = document.getElementById('btn-test-microphone');
    if (testMicBtn) {
        testMicBtn.addEventListener('click', async () => {
            await testMicrophone();
        });
    }
    
    // Load devices
    loadAudioDevices();
}

// Show voice settings modal
function showVoiceSettings() {
    const modal = document.getElementById('voice-settings-modal');
    if (!modal) return;
    
    // Load current settings into modal
    loadVoiceSettingsIntoModal();
    
    // Load devices
    loadAudioDevices();
    
    modal.classList.remove('hidden');
}

// Load audio devices
async function loadAudioDevices() {
    const inputSelect = document.getElementById('input-device-select');
    const outputSelect = document.getElementById('output-device-select');
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        if (inputSelect) {
            inputSelect.innerHTML = '<option value="">Sélectionner un microphone</option>';
            devices.filter(d => d.kind === 'audioinput').forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Microphone ${inputSelect.options.length}`;
                if (device.deviceId === voiceSettings.inputDeviceId) {
                    option.selected = true;
                }
                inputSelect.appendChild(option);
            });
        }
        
        if (outputSelect) {
            outputSelect.innerHTML = '<option value="">Sélectionner un haut-parleur</option>';
            devices.filter(d => d.kind === 'audiooutput').forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Haut-parleur ${outputSelect.options.length}`;
                if (device.deviceId === voiceSettings.outputDeviceId) {
                    option.selected = true;
                }
                outputSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading audio devices:', error);
        if (inputSelect) inputSelect.innerHTML = '<option value="">Erreur de chargement</option>';
        if (outputSelect) outputSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

// Load voice settings into modal
function loadVoiceSettingsIntoModal() {
    const inputVolumeSlider = document.getElementById('input-volume-slider');
    const outputVolumeSlider = document.getElementById('output-volume-slider');
    const inputVolumeValue = document.getElementById('input-volume-value');
    const outputVolumeValue = document.getElementById('output-volume-value');
    
    if (inputVolumeSlider) {
        inputVolumeSlider.value = voiceSettings.inputVolume;
    }
    if (inputVolumeValue) {
        inputVolumeValue.textContent = `${voiceSettings.inputVolume}%`;
    }
    
    if (outputVolumeSlider) {
        outputVolumeSlider.value = voiceSettings.outputVolume;
    }
    if (outputVolumeValue) {
        outputVolumeValue.textContent = `${voiceSettings.outputVolume}%`;
    }
}

// Save voice settings from modal
function saveVoiceSettingsFromModal() {
    const inputDeviceSelect = document.getElementById('input-device-select');
    const outputDeviceSelect = document.getElementById('output-device-select');
    
    if (inputDeviceSelect) {
        voiceSettings.inputDeviceId = inputDeviceSelect.value || null;
    }
    if (outputDeviceSelect) {
        voiceSettings.outputDeviceId = outputDeviceSelect.value || null;
    }
    
    saveVoiceSettings();
    
    // Apply settings if in voice channel
    if (isInVoiceChannel && localStream) {
        applyInputVolume();
        applyOutputVolume();
    }
}

// Reset voice settings
function resetVoiceSettings() {
    voiceSettings = {
        inputDeviceId: null,
        outputDeviceId: null,
        inputVolume: 100,
        outputVolume: 100
    };
    
    loadVoiceSettingsIntoModal();
    saveVoiceSettings();
    
    // Apply settings if in voice channel
    if (isInVoiceChannel && localStream) {
        applyInputVolume();
        applyOutputVolume();
    }
}

// Apply input volume to microphone gain
function applyInputVolume() {
    if (!localStream) return;
    
    const gainNode = getOrCreateGainNode();
    if (gainNode) {
        gainNode.gain.value = voiceSettings.inputVolume / 100;
    }
}

// Apply output volume to audio elements
function applyOutputVolume() {
    // Apply to all peer connection audio elements
    peerConnections.forEach((pc, userId) => {
        const audioElements = document.querySelectorAll(`audio[data-peer-id="${userId}"]`);
        audioElements.forEach(audio => {
            audio.volume = voiceSettings.outputVolume / 100;
        });
    });
}

// Get or create gain node for input volume control
let inputGainNode = null;
let audioContext = null;

function getOrCreateGainNode() {
    if (!localStream) return null;
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (!inputGainNode) {
        const source = audioContext.createMediaStreamSource(localStream);
        inputGainNode = audioContext.createGain();
        source.connect(inputGainNode);
        inputGainNode.connect(audioContext.destination);
    }
    
    return inputGainNode;
}

// Reconnect with new input device
async function reconnectWithNewDevice() {
    if (!isInVoiceChannel || !currentVoiceChannel) return;
    
    try {
        // Stop old stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Get new stream with selected device
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: voiceSettings.inputDeviceId ? { exact: voiceSettings.inputDeviceId } : undefined,
                sampleRate: 48000,
                channelCount: 1
            }
        });
        
        // Apply volume
        applyInputVolume();
        
        // Update UI
        updateVoiceControlsBar();
        
    } catch (error) {
        console.error('Error reconnecting with new device:', error);
        alert('Erreur lors du changement de périphérique: ' + error.message);
    }
}

// Test microphone with audio feedback (like Discord)
let testAudioContext = null;
let testGainNode = null;
let testOscillator = null;
let testStream = null;
let testVisualInterval = null;

async function testMicrophone() {
    const testBtn = document.getElementById('btn-test-microphone');
    const testBar = document.getElementById('voice-test-bar');
    
    if (!testBtn || !testBar) return;
    
    // Stop any existing test first
    stopMicrophoneTest();
    
    try {
        // Request temporary microphone access if not already available
        testStream = localStream;
        if (!testStream) {
            testStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: voiceSettings.inputDeviceId ? { exact: voiceSettings.inputDeviceId } : undefined
                }
            });
        }
        
        // Create audio context for test
        testAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = testAudioContext.createAnalyser();
        const microphone = testAudioContext.createMediaStreamSource(testStream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        // Create oscillator for audio feedback (like Discord's test sound)
        testOscillator = testAudioContext.createOscillator();
        testOscillator.type = 'sine';
        testOscillator.frequency.value = 440; // A4 note
        
        const oscillatorGain = testAudioContext.createGain();
        testOscillator.connect(oscillatorGain);
        oscillatorGain.gain.value = 0.1; // Low volume
        oscillatorGain.connect(testAudioContext.destination);
        
        // Play test sound
        testOscillator.start();
        
        // Visual feedback
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        testVisualInterval = setInterval(() => {
            if (!testOscillator || !testAudioContext) {
                stopMicrophoneTest();
                return;
            }
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const percentage = Math.min(100, (average / 255) * 100);
            if (testBar) {
                testBar.style.width = `${percentage}%`;
            }
        }, 100);
        
        // Stop after 3 seconds
        const stopTimeout = setTimeout(() => {
            stopMicrophoneTest();
        }, 3000);
        
        // Store timeout ID to clear if needed
        if (testBtn) {
            testBtn.dataset.stopTimeout = stopTimeout;
        }
        
        testBtn.textContent = 'Test en cours...';
        testBtn.disabled = true;
        
    } catch (error) {
        console.error('Error testing microphone:', error);
        alert('Erreur lors du test du microphone: ' + error.message);
        stopMicrophoneTest();
    }
}

function stopMicrophoneTest() {
    const testBtn = document.getElementById('btn-test-microphone');
    const testBar = document.getElementById('voice-test-bar');
    
    // Clear timeout if exists
    if (testBtn && testBtn.dataset.stopTimeout) {
        clearTimeout(parseInt(testBtn.dataset.stopTimeout));
        delete testBtn.dataset.stopTimeout;
    }
    
    // Stop visual feedback
    if (testVisualInterval) {
        clearInterval(testVisualInterval);
        testVisualInterval = null;
    }
    
    // Stop oscillator FIRST (most important)
    if (testOscillator) {
        try {
            testOscillator.stop();
        } catch (e) {
            // Already stopped
        }
        try {
            testOscillator.disconnect();
        } catch (e) {
            // Already disconnected
        }
        testOscillator = null;
    }
    
    // Close audio context
    if (testAudioContext) {
        try {
            // Disconnect all nodes before closing
            if (testAudioContext.state !== 'closed') {
                testAudioContext.close();
            }
        } catch (e) {
            // Already closed or error
        }
        testAudioContext = null;
    }
    
    testGainNode = null;
    
    // Stop test stream if it was created separately
    if (testStream && testStream !== localStream) {
        testStream.getTracks().forEach(track => {
            track.stop();
        });
        testStream = null;
    }
    
    // Reset UI
    if (testBar) {
        testBar.style.width = '0%';
    }
    
    if (testBtn) {
        testBtn.textContent = 'Tester le microphone';
        testBtn.disabled = false;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVoiceControls);
} else {
    initializeVoiceControls();
}

// Update voice UI (Discord-style)
function updateVoiceUI(inVoice) {
    renderChannels();
    
    const voicePanel = document.getElementById('voice-channel-panel');
    const voiceControlsBar = document.getElementById('voice-controls-bar');
    const textChannelHeader = document.getElementById('text-channel-header');
    const voiceChannelHeader = document.getElementById('voice-channel-header');
    const messagesArea = document.getElementById('messages');
    const voiceChannelView = document.getElementById('voice-channel-view');
    const typingIndicator = document.getElementById('typing-indicator');
    const replyIndicator = document.getElementById('reply-indicator');
    const chatInputArea = document.querySelector('.chat-input-area');
    const filePreviewArea = document.getElementById('file-preview-area');
    
    if (inVoice && currentVoiceChannel) {
        // Show voice interface
        if (voicePanel) {
            voicePanel.classList.remove('hidden');
            const channelNameDisplay = document.getElementById('voice-channel-name-display');
            if (channelNameDisplay) {
                channelNameDisplay.textContent = `🔊 ${currentVoiceChannel.name}`;
            }
        }
        
        if (voiceControlsBar) {
            voiceControlsBar.classList.remove('hidden');
            updateVoiceControlsBar();
        }
        
        // Hide text channel UI
        if (textChannelHeader) textChannelHeader.classList.add('hidden');
        if (messagesArea) messagesArea.classList.add('hidden');
        if (typingIndicator) typingIndicator.classList.add('hidden');
        if (replyIndicator) replyIndicator.classList.add('hidden');
        if (chatInputArea) chatInputArea.classList.add('hidden');
        if (filePreviewArea) filePreviewArea.classList.add('hidden');
        
        // Show voice channel UI
        if (voiceChannelHeader) {
            voiceChannelHeader.classList.remove('hidden');
            const voiceHeaderName = document.getElementById('voice-channel-header-name');
            const voiceHeaderDesc = document.getElementById('voice-channel-header-desc');
            if (voiceHeaderName) voiceHeaderName.textContent = currentVoiceChannel.name;
            if (voiceHeaderDesc) voiceHeaderDesc.textContent = `${voiceParticipants.size} participant${voiceParticipants.size > 1 ? 's' : ''}`;
        }
        
        if (voiceChannelView) {
            voiceChannelView.classList.remove('hidden');
            updateVoiceChannelGrid();
        }
        
        // Update current user in participants
        if (currentUser) {
            voiceParticipants.set(currentUser.id, {
                userId: currentUser.id,
                username: currentUser.username,
                muted: isMuted,
                deafened: isDeafened,
                speaking: false
            });
        }
        
        updateVoiceParticipantsList();
    } else {
        // Hide voice interface
        if (voicePanel) {
            voicePanel.classList.add('hidden');
        }
        if (voiceControlsBar) {
            voiceControlsBar.classList.add('hidden');
        }
        if (voiceChannelHeader) {
            voiceChannelHeader.classList.add('hidden');
        }
        if (voiceChannelView) {
            voiceChannelView.classList.add('hidden');
        }
        
        // Show text channel UI
        if (textChannelHeader) textChannelHeader.classList.remove('hidden');
        if (messagesArea) messagesArea.classList.remove('hidden');
        if (chatInputArea) chatInputArea.classList.remove('hidden');
    }
}

// Update voice channel grid (Discord-style main view)
function updateVoiceChannelGrid() {
    const grid = document.getElementById('voice-channel-grid');
    const empty = document.getElementById('voice-channel-empty');
    
    if (!grid || !empty) return;
    
    if (voiceParticipants.size === 0) {
        grid.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    
    grid.innerHTML = '';
    
    // Convert to array and sort (current user first, then alphabetically)
    const participantsArray = Array.from(voiceParticipants.values());
    participantsArray.sort((a, b) => {
        if (a.userId === currentUser.id) return -1;
        if (b.userId === currentUser.id) return 1;
        return (a.username || '').localeCompare(b.username || '');
    });
    
    participantsArray.forEach(participant => {
        const user = users.find(u => u.id === participant.userId) || {
            id: participant.userId,
            username: participant.username || `User ${participant.userId}`,
            avatar: null,
            avatar_color: null,
            status: 'online'
        };
        
        const card = document.createElement('div');
        card.className = `voice-participant-card ${participant.speaking ? 'speaking' : ''} ${participant.userId === currentUser.id ? 'self' : ''} ${participant.screenSharing ? 'screen-sharing' : ''}`;
        card.setAttribute('data-user-id', participant.userId);
        
        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'voice-participant-card-avatar-wrapper';
        
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container voice-participant-card-avatar-container';
        avatarContainer.style.position = 'relative';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar voice-participant-card-avatar';
        updateAvatarElement(avatar, user.avatar, user.username, user.avatar_color);
        
        // Status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `status-indicator voice-participant-card-status ${user.status || 'online'}`;
        
        // Speaking ring animation
        if (participant.speaking) {
            const speakingRing = document.createElement('div');
            speakingRing.className = 'voice-speaking-ring';
            avatarContainer.appendChild(speakingRing);
        }
        
        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(statusIndicator);
        avatarWrapper.appendChild(avatarContainer);
        
        const info = document.createElement('div');
        info.className = 'voice-participant-card-info';
        
        const name = document.createElement('div');
        name.className = 'voice-participant-card-name';
        name.textContent = user.username;
        if (participant.userId === currentUser.id) {
            name.textContent += ' (Vous)';
        }
        
        const status = document.createElement('div');
        status.className = 'voice-participant-card-status-text';
        if (participant.screenSharing) {
            status.textContent = '📺 Partage son écran';
            status.classList.add('screen-sharing');
        } else if (participant.deafened) {
            status.textContent = '🔇 Sourd';
            status.classList.add('deafened');
        } else if (participant.muted) {
            status.textContent = '🔇 Microphone coupé';
            status.classList.add('muted');
        } else if (participant.speaking) {
            status.textContent = 'Parle...';
            status.classList.add('speaking');
        } else {
            status.textContent = 'Connecté';
        }
        
        info.appendChild(name);
        info.appendChild(status);
        
        // Add screen share button if participant is sharing screen
        if (participant.screenSharing) {
            const screenShareBtn = document.createElement('button');
            screenShareBtn.className = 'voice-participant-screen-share-btn';
            screenShareBtn.title = 'Voir le partage d\'écran';
            screenShareBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
            `;
            screenShareBtn.onclick = async (e) => {
                e.stopPropagation();
                
                // Check if we already have the stream
                const share = activeScreenShares.get(participant.userId);
                if (share && share.stream) {
                    // Stream already available, show it
                    showScreenShare(share.userId, share.username, share.stream, share.isLocal);
                } else {
                    // Stream not yet received, show loading and wait for it
                    // The stream will be received via WebRTC signaling
                    const container = document.getElementById('screen-share-container');
                    const loading = document.getElementById('screen-share-loading');
                    const overlay = document.querySelector('.screen-share-overlay');
                    
                    if (container && loading && overlay) {
                        container.classList.remove('hidden');
                        loading.classList.remove('hidden');
                        overlay.classList.remove('hidden');
                        const grid = document.getElementById('voice-channel-grid');
                        if (grid) grid.classList.add('hidden');
                        screenShareViewMode = 'screen-share';
                        currentScreenShareUserId = participant.userId;
                    }
                    
                    // The stream will be received via handleScreenShareOffer/handleScreenShareAnswer
                    // and will automatically update the view when it arrives
                }
            };
            card.appendChild(screenShareBtn);
        }
        
        card.appendChild(avatarWrapper);
        card.appendChild(info);
        
        // Make clickable to show profile
        if (participant.userId !== currentUser.id) {
            card.style.cursor = 'pointer';
            card.title = `Voir le profil de ${user.username}`;
            card.onclick = (e) => {
                e.stopPropagation();
                const rect = card.getBoundingClientRect();
                showUserProfileCard(participant.userId, user.username, rect);
            };
        }
        
        grid.appendChild(card);
    });
}

// Update voice controls bar (Discord-style)
function updateVoiceControlsBar() {
    if (!currentUser) return;
    
    // Update bottom bar avatar
    const voiceAvatar = document.getElementById('voice-controls-avatar');
    const voiceStatus = document.getElementById('voice-controls-status');
    const voiceUsername = document.getElementById('voice-controls-username');
    const voiceStatusText = document.getElementById('voice-controls-status-text');
    
    if (voiceAvatar) {
        updateAvatarElement(voiceAvatar, currentUser.avatar, currentUser.username, currentUser.avatar_color);
    }
    
    if (voiceStatus) {
        voiceStatus.className = `status-indicator voice-status-indicator ${currentUser.status || 'online'}`;
    }
    
    if (voiceUsername) {
        voiceUsername.textContent = currentUser.username;
    }
    
    if (voiceStatusText) {
        if (isDeafened) {
            voiceStatusText.textContent = '🔇 Sourd';
            voiceStatusText.classList.add('deafened');
        } else if (isMuted) {
            voiceStatusText.textContent = '🔇 Microphone coupé';
            voiceStatusText.classList.add('muted');
        } else if (isInVoiceChannel) {
            voiceStatusText.textContent = 'Connecté';
            voiceStatusText.classList.remove('muted', 'deafened');
        } else {
            voiceStatusText.textContent = 'Non connecté';
            voiceStatusText.classList.remove('muted', 'deafened');
        }
    }
    
    // Update main view avatar
    const mainAvatar = document.getElementById('voice-main-avatar');
    const mainStatusIndicator = document.getElementById('voice-main-status');
    const mainUsername = document.getElementById('voice-main-username');
    const mainStatusText = document.getElementById('voice-main-status-text');
    
    if (mainAvatar) {
        updateAvatarElement(mainAvatar, currentUser.avatar, currentUser.username, currentUser.avatar_color);
    }
    
    if (mainStatusIndicator) {
        mainStatusIndicator.className = `status-indicator voice-main-status-indicator ${currentUser.status || 'online'}`;
    }
    
    if (mainUsername) {
        mainUsername.textContent = currentUser.username;
    }
    
    if (mainStatusText) {
        if (isDeafened) {
            mainStatusText.textContent = '🔇 Sourd';
            mainStatusText.classList.add('deafened');
        } else if (isMuted) {
            mainStatusText.textContent = '🔇 Microphone coupé';
            mainStatusText.classList.add('muted');
        } else if (isInVoiceChannel) {
            mainStatusText.textContent = 'Connecté';
            mainStatusText.classList.remove('muted', 'deafened');
        } else {
            mainStatusText.textContent = 'Non connecté';
            mainStatusText.classList.remove('muted', 'deafened');
        }
    }
    
    // Update button states (bottom bar)
    const micIcon = document.getElementById('mic-icon');
    const micMutedIcon = document.getElementById('mic-muted-icon');
    const headphoneIcon = document.getElementById('headphone-icon');
    const headphoneDeafenIcon = document.getElementById('headphone-deafen-icon');
    const muteBtn = document.getElementById('btn-voice-mute');
    const deafenBtn = document.getElementById('btn-voice-deafen');
    
    if (micIcon && micMutedIcon) {
        if (isMuted || isDeafened) {
            micIcon.classList.add('hidden');
            micMutedIcon.classList.remove('hidden');
        } else {
            micIcon.classList.remove('hidden');
            micMutedIcon.classList.add('hidden');
        }
    }
    
    if (headphoneIcon && headphoneDeafenIcon) {
        if (isDeafened) {
            headphoneIcon.classList.add('hidden');
            headphoneDeafenIcon.classList.remove('hidden');
        } else {
            headphoneIcon.classList.remove('hidden');
            headphoneDeafenIcon.classList.add('hidden');
        }
    }
    
    // Update button states (main view)
    const micIconMain = document.getElementById('mic-icon-main');
    const micMutedIconMain = document.getElementById('mic-muted-icon-main');
    const headphoneIconMain = document.getElementById('headphone-icon-main');
    const headphoneDeafenIconMain = document.getElementById('headphone-deafen-icon-main');
    const muteBtnMain = document.getElementById('btn-voice-mute-main');
    const deafenBtnMain = document.getElementById('btn-voice-deafen-main');
    
    if (micIconMain && micMutedIconMain) {
        if (isMuted || isDeafened) {
            micIconMain.classList.add('hidden');
            micMutedIconMain.classList.remove('hidden');
        } else {
            micIconMain.classList.remove('hidden');
            micMutedIconMain.classList.add('hidden');
        }
    }
    
    if (headphoneIconMain && headphoneDeafenIconMain) {
        if (isDeafened) {
            headphoneIconMain.classList.add('hidden');
            headphoneDeafenIconMain.classList.remove('hidden');
        } else {
            headphoneIconMain.classList.remove('hidden');
            headphoneDeafenIconMain.classList.add('hidden');
        }
    }
    
    if (muteBtn) {
        muteBtn.classList.toggle('active', isMuted || isDeafened);
    }
    
    if (deafenBtn) {
        deafenBtn.classList.toggle('active', isDeafened);
    }
}

// Socket events for voice
socket.on('voiceRoomJoined', (data) => {
    console.log('Joined voice room:', data);
    voiceParticipants.clear();
    if (data.participants) {
        data.participants.forEach(participant => {
            const userId = typeof participant === 'object' ? participant.userId : participant;
            const user = users.find(u => u.id === userId);
            voiceParticipants.set(userId, {
                userId,
                username: user?.username || `User ${userId}`,
                muted: participant.muted || false,
                deafened: participant.deafened || false,
                speaking: false
            });
        });
    }
    // Add current user if not already present
    if (currentUser && !voiceParticipants.has(currentUser.id)) {
        voiceParticipants.set(currentUser.id, {
            userId: currentUser.id,
            username: currentUser.username,
            muted: isMuted,
            deafened: isDeafened,
            speaking: false
        });
    }
    updateVoiceParticipantsList();
    updateVoiceChannelGrid(); // Update main grid view
    renderChannels(); // Update channel list to show active voice channel
});

socket.on('userJoinedVoice', (data) => {
    console.log('User joined voice:', data);
    const user = users.find(u => u.id === data.userId);
    voiceParticipants.set(data.userId, {
        userId: data.userId,
        username: user?.username || `User ${data.userId}`,
        muted: data.muted || false,
        deafened: data.deafened || false,
        speaking: false
    });
    
    // Update channel participants map
    if (data.channelId && voiceChannelParticipants.has(data.channelId)) {
        voiceChannelParticipants.get(data.channelId).add(data.userId);
    }
    
    updateVoiceParticipantsList();
    updateVoiceChannelGrid(); // Update main grid view
    renderChannels(); // Update channel list
    
    // Update header description
    if (currentVoiceChannel && isInVoiceChannel) {
        const voiceHeaderDesc = document.getElementById('voice-channel-header-desc');
        if (voiceHeaderDesc) {
            voiceHeaderDesc.textContent = `${voiceParticipants.size} participant${voiceParticipants.size > 1 ? 's' : ''}`;
        }
    }
});

socket.on('userLeftVoice', (data) => {
    console.log('User left voice:', data);
    voiceParticipants.delete(data.userId);
    
    // Update channel participants map
    if (data.channelId && voiceChannelParticipants.has(data.channelId)) {
        voiceChannelParticipants.get(data.channelId).delete(data.userId);
    }
    
    updateVoiceParticipantsList();
    updateVoiceChannelGrid(); // Update main grid view
    renderChannels(); // Update channel list
    
    // Update header description
    if (currentVoiceChannel && isInVoiceChannel) {
        const voiceHeaderDesc = document.getElementById('voice-channel-header-desc');
        if (voiceHeaderDesc) {
            voiceHeaderDesc.textContent = `${voiceParticipants.size} participant${voiceParticipants.size > 1 ? 's' : ''}`;
        }
    }
});

socket.on('voice_mute_status', (data) => {
    const participant = voiceParticipants.get(data.userId);
    if (participant) {
        participant.muted = data.muted;
        updateVoiceParticipantsList();
        updateVoiceChannelGrid(); // Update main grid view
    }
});

socket.on('voice_deafen_status', (data) => {
    const participant = voiceParticipants.get(data.userId);
    if (participant) {
        participant.deafened = data.deafened;
        if (data.deafened) {
            participant.muted = true; // Deafened users are also muted
        }
        updateVoiceParticipantsList();
        updateVoiceChannelGrid(); // Update main grid view
    }
});

// Screen share events
socket.on('screen_share_start', async (data) => {
    console.log('User started screen share:', data);
    const user = users.find(u => u.id === data.userId);
    
    if (user && data.userId !== currentUser.id) {
        // Update participant status
        const participant = voiceParticipants.get(data.userId);
        if (participant) {
            participant.screenSharing = true;
            updateVoiceParticipantsList();
            updateVoiceChannelGrid();
        }
        
        // Show loading state - stream will be received via WebRTC
        // If we're in users view, switch to screen share view
        if (screenShareViewMode === 'users') {
            const container = document.getElementById('screen-share-container');
            const loading = document.getElementById('screen-share-loading');
            const overlay = document.querySelector('.screen-share-overlay');
            if (container && loading && overlay) {
                container.classList.remove('hidden');
                loading.classList.remove('hidden');
                overlay.classList.remove('hidden');
                const grid = document.getElementById('voice-channel-grid');
                if (grid) grid.classList.add('hidden');
                screenShareViewMode = 'screen-share';
            }
        }
    }
});

socket.on('screen_share_stop', (data) => {
    console.log('User stopped screen share:', data);
    
    if (data.userId !== currentUser.id) {
        // Update participant status
        const participant = voiceParticipants.get(data.userId);
        if (participant) {
            participant.screenSharing = false;
            participant.screenStream = null;
            updateVoiceParticipantsList();
            updateVoiceChannelGrid();
        }
        
        // If this was the currently displayed screen share, switch to another or go back to users
        if (currentScreenShareUserId === data.userId) {
            hideScreenShare();
        }
        
        // Remove from active screen shares
        activeScreenShares.delete(data.userId);
        
        // Close peer connection
        const pc = screenSharePeerConnections.get(data.userId);
        if (pc) {
            try {
                pc.close();
            } catch (e) {
                console.error('Error closing peer connection:', e);
            }
            screenSharePeerConnections.delete(data.userId);
        }
    }
});

// WebRTC screen share signaling
socket.on('screen_share_offer', async (data) => {
    if (data.targetUserId === currentUser.id) {
        await handleScreenShareOffer(data);
    }
});

socket.on('screen_share_answer', async (data) => {
    if (data.targetUserId === currentUser.id) {
        await handleScreenShareAnswer(data);
    }
});

socket.on('screen_share_ice_candidate', (data) => {
    if (data.targetUserId === currentUser.id) {
        handleScreenShareIceCandidate(data);
    }
});

socket.on('voice_speaking', (data) => {
    const participant = voiceParticipants.get(data.userId);
    if (participant) {
        participant.speaking = true;
        updateVoiceParticipantsList();
        
        // Auto-hide speaking indicator after 500ms
        setTimeout(() => {
            const p = voiceParticipants.get(data.userId);
            if (p) {
                p.speaking = false;
                updateVoiceParticipantsList();
            }
        }, 500);
    }
});

// WebRTC: Handle new user joining voice (simplified - no producer/consumer needed)
socket.on('newProducer', async (data) => {
    console.log('New producer (WebRTC - can be ignored):', data);
    // WebRTC handles this through peer connections
});

socket.on('producerClosed', (data) => {
    console.log('Producer closed (WebRTC - can be ignored):', data);
    // WebRTC handles this through peer connections
    voiceParticipants.delete(data.userId);
    updateVoiceParticipantsList();
});

// Update voice participants list (Discord-style)
function updateVoiceParticipantsList() {
    const participantsList = document.getElementById('voice-participants-list');
    if (!participantsList) return;
    
    participantsList.innerHTML = '';
    
    if (voiceParticipants.size === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'voice-participants-empty';
        emptyDiv.textContent = 'Aucun participant';
        participantsList.appendChild(emptyDiv);
        return;
    }
    
    // Convert to array and sort (current user first, then alphabetically)
    const participantsArray = Array.from(voiceParticipants.values());
    participantsArray.sort((a, b) => {
        if (a.userId === currentUser.id) return -1;
        if (b.userId === currentUser.id) return 1;
        return (a.username || '').localeCompare(b.username || '');
    });
    
    participantsArray.forEach(participant => {
        const user = users.find(u => u.id === participant.userId) || {
            id: participant.userId,
            username: participant.username || `User ${participant.userId}`,
            avatar: null,
            avatar_color: null,
            status: 'online'
        };
        
        const div = document.createElement('div');
        div.className = `voice-participant-item ${participant.speaking ? 'speaking' : ''} ${participant.userId === currentUser.id ? 'self' : ''}`;
        div.setAttribute('data-user-id', participant.userId);
        
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container voice-participant-avatar';
        avatarContainer.style.position = 'relative';
        avatarContainer.style.display = 'inline-block';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar voice-participant-avatar-img';
        updateAvatarElement(avatar, user.avatar, user.username, user.avatar_color);
        
        // Status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `status-indicator ${user.status || 'online'}`;
        statusIndicator.style.position = 'absolute';
        statusIndicator.style.bottom = '0';
        statusIndicator.style.right = '0';
        
        // Speaking indicator (green ring when speaking)
        if (participant.speaking) {
            const speakingRing = document.createElement('div');
            speakingRing.className = 'speaking-ring';
            avatarContainer.appendChild(speakingRing);
        }
        
        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(statusIndicator);
        
        const nameContainer = document.createElement('div');
        nameContainer.className = 'voice-participant-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'voice-participant-name';
        nameSpan.textContent = user.username;
        if (participant.userId === currentUser.id) {
            nameSpan.textContent += ' (Vous)';
        }
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'voice-participant-status';
        if (participant.deafened) {
            statusSpan.textContent = '🔇 Sourd';
            statusSpan.classList.add('deafened');
        } else if (participant.muted) {
            statusSpan.textContent = '🔇 Microphone coupé';
            statusSpan.classList.add('muted');
        } else if (participant.speaking) {
            statusSpan.textContent = 'Parle...';
            statusSpan.classList.add('speaking');
        } else {
            statusSpan.textContent = 'Connecté';
        }
        
        nameContainer.appendChild(nameSpan);
        nameContainer.appendChild(statusSpan);
        
        div.appendChild(avatarContainer);
        div.appendChild(nameContainer);
        
        // Make clickable to show profile
        if (participant.userId !== currentUser.id) {
            div.style.cursor = 'pointer';
            div.title = `Voir le profil de ${user.username}`;
            div.onclick = (e) => {
                e.stopPropagation();
                const rect = div.getBoundingClientRect();
                showUserProfileCard(participant.userId, user.username, rect);
            };
        }
        
        participantsList.appendChild(div);
    });
}