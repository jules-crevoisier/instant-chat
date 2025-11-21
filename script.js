const socket = io("http://localhost:3000");

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

// File upload state
let selectedFiles = [];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
        
        // If message is from a new member, reload members list
        if (msg.sender_id && !channelMembers.find(m => m.id === msg.sender_id)) {
            loadChannelMembers(currentChannel.id);
        }
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
    
    // If user not in cache but we have sender_id, load it
    if (!userInfo && senderId) {
        fetch(`http://localhost:3000/api/users/${senderId}`)
            .then(res => res.json())
            .then(user => {
                if (!users.find(u => u.id === user.id)) {
                    users.push(user);
                }
                // Update avatar in message
                const msgElement = document.getElementById(`msg-${data.id}`);
                if (msgElement) {
                    const avatar = msgElement.querySelector(".msg-avatar");
                    if (avatar) {
                        updateAvatarElement(avatar, user.avatar, user.username, user.avatar_color);
                    }
                }
            })
            .catch(() => {});
        userInfo = { username: data.username, id: senderId };
    } else if (!userInfo) {
        userInfo = { username: data.username, id: senderId };
    }
    
    const msgAvatar = document.createElement("div");
    msgAvatar.className = "msg-avatar";
    updateAvatarElement(msgAvatar, userInfo.avatar, data.username, userInfo.avatar_color);
    
    const pseudo = document.createElement("div");
    pseudo.className = "pseudo";
    pseudo.textContent = data.username;
    
    // Make username clickable if we have an ID (including current user)
    const userId = userInfo.id || senderId || (data.username === currentUser.username ? currentUser.id : null);
    
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
    
    msgHeader.appendChild(msgAvatar);
    msgHeader.appendChild(pseudo);

    const content = document.createElement("div");
    content.className = "msg-content";

    // Handle file attachments
    if (data.file_path) {
        const fileContainer = document.createElement("div");
        fileContainer.className = "msg-file-container";
        
        const fileIcon = getFileIcon(data.file_type || "");
        const fileName = data.file_name || "Fichier";
        const fileSize = data.file_size ? formatFileSize(data.file_size) : "";
        const fileUrl = `http://localhost:3000${data.file_path}`;
        
        const fileElement = document.createElement("div");
        fileElement.className = "msg-file";
        
        // Determine file type and create appropriate display
        if (data.file_type && data.file_type.startsWith("image/")) {
            // Image preview
            const img = document.createElement("img");
            img.src = fileUrl;
            img.className = "msg-file-image";
            img.alt = fileName;
            img.onclick = () => window.open(fileUrl, "_blank");
            fileElement.appendChild(img);
        } else if (data.file_type && data.file_type.startsWith("audio/")) {
            // Audio player
            const audio = document.createElement("audio");
            audio.src = fileUrl;
            audio.controls = true;
            audio.className = "msg-file-audio";
            fileElement.appendChild(audio);
        } else if (data.file_type && data.file_type.startsWith("video/")) {
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
        content.appendChild(fileContainer);
    }

    // Handle text message with mentions
    if (data.message) {
        let text = data.message;
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
        content.appendChild(textDiv);
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

    div.appendChild(msgHeader);
    div.appendChild(content);
    div.appendChild(reactionsDiv);

    messagesContainer.appendChild(div);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

    // Send message(s) - one per file or one with message
    if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
            const payload = {
                username: currentUser.username,
                message: message || file.originalName,
                reply_to_id: activeReply ? activeReply.id : null,
                file_path: file.path,
                file_name: file.originalName,
                file_type: file.mimetype,
                file_size: file.size
            };

            if (currentChannel) {
                payload.channel_id = currentChannel.id;
                payload.sender_id = currentUser.id;
            } else if (currentRecipient) {
                payload.recipient_id = currentRecipient.id;
                payload.sender_id = currentUser.id;
            }

            socket.emit("send_message", payload);
        }
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
}

async function uploadFiles(files) {
    const uploadPromises = [];
    
    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Le fichier "${file.name}" dépasse la taille maximale de 50MB`);
        }

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

    files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
            errors.push(`"${file.name}" dépasse 50MB`);
        } else {
            validFiles.push(file);
        }
    });

    if (errors.length > 0) {
        alert("Erreurs:\n" + errors.join("\n"));
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
            <button class="file-preview-remove" data-index="${index}">✕</button>
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

btnSend.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
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
    updateUserStatus(user);

    socket.emit("user_login", user.id);
    requestNotificationPermission();

    loadChannels();
    loadConversations();
    loadUserProfile().then(() => {
        // Add current user to users array for message display
        if (currentUser && !users.find(u => u.id === currentUser.id)) {
            users.push(currentUser);
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

function updateUserStatus(user) {
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
            updateUserStatus(currentUser);
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
            updateUserStatus(currentUser);
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

    chatChannelName.textContent = `@ ${user.username}`;
    chatChannelDesc.textContent = "Message privé";
    messagesContainer.innerHTML = "";

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