const socket = io("http://localhost:3000");

// State
let currentUser = null;
let currentChannel = null;
let currentRecipient = null; // For DMs
let channels = [];
let users = [];

// DOM Elements
const loginView = document.getElementById("login-view");
const chatView = document.getElementById("chat-view");

const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");

const channelsList = document.getElementById("channels-list");
const usersList = document.getElementById("users-list");
const userAvatar = document.getElementById("user-avatar");
const currentUsernameDisplay = document.getElementById("current-username");
const btnLogout = document.getElementById("btn-logout");

const chatChannelName = document.getElementById("chat-channel-name");
const chatChannelDesc = document.getElementById("chat-channel-desc");
const messagesContainer = document.getElementById("messages");
const msgInput = document.getElementById("msg-input");
const btnSend = document.getElementById("btn-send");

// --- AUTHENTICATION ---

btnLogin.addEventListener("click", async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if (!username || !password) return alert("Veuillez remplir tous les champs");

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
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion");
    }
});

btnRegister.addEventListener("click", async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if (!username || !password) return alert("Veuillez remplir tous les champs");

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
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion");
    }
});

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

socket.on("message_history", (messages) => {
    messagesContainer.innerHTML = "";
    messages.forEach(msg => displayMessage(msg));
    scrollToBottom();
});

socket.on("receive_message", (msg) => {
    // Logic to decide if we show the message
    let shouldDisplay = false;

    if (currentChannel && msg.channel_id === currentChannel.id) {
        shouldDisplay = true;
    } else if (currentRecipient && (msg.recipient_id === currentUser.id || msg.recipient_id === currentRecipient.id) && (msg.username === currentRecipient.username || msg.username === currentUser.username)) {
        shouldDisplay = true;
    }

    if (shouldDisplay) {
        displayMessage(msg);
        scrollToBottom();
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

function displayMessage(data) {
    const div = document.createElement("div");
    div.className = `msg ${data.username === currentUser.username ? 'me' : ''}`;
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

    const pseudo = document.createElement("div");
    pseudo.className = "pseudo";
    pseudo.textContent = data.username;

    const content = document.createElement("div");
    content.className = "msg-content";

    // Handle mentions
    let text = data.message;
    const mentionRegex = /@(\w+)/g;
    text = text.replace(mentionRegex, (match, username) => {
        if (username === currentUser.username) {
            return `<span class="mention highlight">${match}</span>`;
        }
        return `<span class="mention">${match}</span>`;
    });

    content.innerHTML = text;

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

    // Add Reaction Button
    const addBtn = document.createElement("button");
    addBtn.className = "msg-action-btn";
    addBtn.innerHTML = "+";
    addBtn.title = "Ajouter une réaction";
    addBtn.onclick = (e) => {
        e.stopPropagation();
        openReactionPicker(data.id, addBtn);
    };
    actionsDiv.appendChild(addBtn);

    // Reply Button
    const replyBtn = document.createElement("button");
    replyBtn.className = "msg-action-btn";
    replyBtn.innerHTML = "↩";
    replyBtn.title = "Répondre";
    replyBtn.onclick = (e) => {
        e.stopPropagation();
        startReply(data.id, data.username, data.message);
    };
    actionsDiv.appendChild(replyBtn);

    reactionsDiv.appendChild(actionsDiv);

    div.appendChild(pseudo);
    div.appendChild(content);
    div.appendChild(reactionsDiv);

    messagesContainer.appendChild(div);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const message = msgInput.value.trim();
    if (!message || !currentUser) return;

    const payload = {
        username: currentUser.username,
        message: message,
        reply_to_id: activeReply ? activeReply.id : null
    };

    if (currentChannel) {
        payload.channel_id = currentChannel.id;
        socket.emit("send_message", payload);
    } else if (currentRecipient) {
        payload.recipient_id = currentRecipient.id;
        payload.sender_id = currentUser.id;
        socket.emit("send_message", payload);
    }

    msgInput.value = "";
    cancelReply();
    closeAutocomplete();
}

btnSend.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function login(user) {
    currentUser = user;
    if (user.token) {
        localStorage.setItem("chat_token", user.token);
    }

    loginView.classList.remove("active");
    loginView.classList.add("hidden");
    chatView.classList.remove("hidden");
    chatView.classList.add("active");

    currentUsernameDisplay.textContent = user.username;
    userAvatar.textContent = user.username.charAt(0).toUpperCase();

    socket.emit("user_login", user.id);
    requestNotificationPermission();

    loadChannels();
    loadConversations();
}

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("chat_token");
    window.location.reload();
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
        div.className = `channel-item ${currentChannel && currentChannel.id === ch.id ? 'active' : ''}`;

        const icon = ch.icon || "💬";

        div.innerHTML = `
            <div class="channel-content">
                <span class="channel-icon">${icon}</span>
                <span>${ch.name}</span>
            </div>
        `;

        // Settings Button (only if not General)
        if (ch.name !== 'Général' && ch.id != 1) {
            const settingsBtn = document.createElement("button");
            settingsBtn.className = "channel-settings-btn";
            settingsBtn.innerHTML = "⋮";
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
            joinChannel(ch);
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
        <button class="icon-btn" id="close-modal">✕</button>
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

        if (name) {
            socket.emit("create_channel", { name, icon: selectedEmoji });
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
            <button class="icon-btn" id="close-modal">✕</button>
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
        users = await res.json();
        renderUsers();
    } catch (e) {
        console.error("Erreur chargement conversations", e);
    }
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
        div.innerHTML = `
            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
            ${u.username}
        `;
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

    chatChannelName.textContent = `# ${channel.name}`;
    chatChannelDesc.textContent = channel.description;
    messagesContainer.innerHTML = ""; // Clear messages

    // Header Settings Button Logic
    if (btnHeaderChannelSettings) {
        if (channel.name !== 'Général' && channel.id != 1) {
            btnHeaderChannelSettings.classList.remove("hidden");
        } else {
            btnHeaderChannelSettings.classList.add("hidden");
        }
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

    chatChannelName.textContent = `@ ${user.username}`;
    chatChannelDesc.textContent = "Message privé";
    messagesContainer.innerHTML = "";

    if (btnHeaderChannelSettings) {
        btnHeaderChannelSettings.classList.add("hidden");
    }

    socket.emit("join_dm", { myId: currentUser.id, otherId: user.id });
}