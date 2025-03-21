// chat.js
let socket = null;
let loggedInUserId = null;
let selectedUserId = null;
let typingTimeout = null;
let currentOffset = 0;
let throttle = false;

export function connectWebSocket(userId) {
    socket = new WebSocket(`ws://localhost:8888/ws?user_id=${userId}`);

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "typing" && msg.from === selectedUserId) {
            showTypingIndicator();
            return;
        }

        if (msg.type === "message") {
            appendMessageToChat(msg);
            updateUserPreview(msg);
        }
    };

    socket.onclose = () => {
        console.log("❌ WebSocket disconnected");
    };
}

export function sendMessage(toId, content) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    const message = {
        type: "message",
        from: loggedInUserId,
        to: toId,
        content: content,
        timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify(message));
    appendMessageToChat(message);
}

function sendTypingSignal() {
    if (!socket || !selectedUserId) return;

    const signal = {
        type: "typing",
        from: loggedInUserId,
        to: selectedUserId
    };

    socket.send(JSON.stringify(signal));
}

function showTypingIndicator() {
    const label = document.getElementById("chatWithLabel");
    const originalText = label.textContent;
    label.textContent = originalText + " (typing...)";

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        label.textContent = originalText.replace(" (typing...)", "");
    }, 1500);
}

export function loadMessages(withId, offset = 0) {
  fetch(`/messages?with=${withId}&offset=${offset}`, { credentials: 'include' })
  .then(res => res.json())
  .then(messages => {
      if (!messages || !Array.isArray(messages)) {
          console.warn("⚠️ No messages received or invalid format.");
          return;
      }

      messages.reverse().forEach(msg => prependMessageToChat(msg));
      throttle = false;
  })
  .catch(err => console.error("❌ Error loading messages:", err));
}

function appendMessageToChat(msg) {
    const container = document.getElementById("chatWindow");
    const node = document.createElement("div");
    node.classList.add("chat-message");
    node.innerHTML = `<strong>${msg.from === loggedInUserId ? "You" : "User " + msg.from}</strong>: ${msg.content} <small>${new Date(msg.timestamp).toLocaleString()}</small>`;
    container.appendChild(node);
    container.scrollTop = container.scrollHeight;
}

function prependMessageToChat(msg) {
    const container = document.getElementById("chatWindow");
    const node = document.createElement("div");
    node.classList.add("chat-message");
    node.innerHTML = `<strong>${msg.from}</strong>: ${msg.content} <small>${new Date(msg.timestamp).toLocaleString()}</small>`;
    container.insertBefore(node, container.firstChild);
}

export function setupScroll(chatUserId) {
    const container = document.getElementById("chatWindow");
    container.addEventListener("scroll", () => {
        if (container.scrollTop === 0 && !throttle) {
            throttle = true;
            currentOffset += 10;
            loadMessages(chatUserId, currentOffset);
        }
    });
}

function updateUserPreview(msg) {
    const userList = document.getElementById("userList").getElementsByTagName("li");
    for (let li of userList) {
        if (li.dataset.userId == msg.from || li.dataset.userId == msg.to) {
            li.classList.add("has-new-message");
        }
    }
}

// --- UI Integration ---
function showChatSection() {
    hideAllSections();
    document.getElementById("chatSection").hidden = false;
}

function hideAllSections() {
    document.getElementById("mainPage").hidden = true;
    document.getElementById("signUpSection").hidden = true;
    document.getElementById("logInSection").hidden = true;
    document.getElementById("postPageSection").hidden = true;
    document.getElementById("createPostSection").hidden = true;
    document.getElementById("aboutUsSection").hidden = true;
    document.getElementById("commentsSection").hidden = true;
    document.getElementById("chatSection").hidden = true;
}

function returnToPosts() {
    hideAllSections();
    document.getElementById("postPageSection").hidden = false;
}

export function loadAndInitChat(userId) {
    loggedInUserId = userId;
    connectWebSocket(userId);
    fetchUserList();
    setupChatForm();
}

function fetchUserList() {
  fetch("/get-users", { credentials: 'include' })
      .then(res => res.json())
      .then(users => {
          const userList = document.getElementById("userList");
          userList.innerHTML = '';

          users.forEach(user => {
              if (user.id !== loggedInUserId) {
                  const li = document.createElement("li");
                  li.dataset.userId = user.id;
                  li.classList.add("user-item");

                  // ✅ Create username span
                  const usernameSpan = document.createElement("span");
                  usernameSpan.textContent = user.username;

                  // ✅ Create status dot
                  const statusDot = document.createElement("span");
                  statusDot.classList.add("status-dot");
                  statusDot.classList.add(user.online ? "online" : "offline");

                  // ✅ Append elements
                  li.appendChild(usernameSpan);
                  li.appendChild(statusDot);
                  li.onclick = () => openChatWith(user.id, user.username);

                  userList.appendChild(li);
              }
          });
      })
      .catch(err => console.error("Failed to fetch users:", err));
}


function openChatWith(userId, username) {
    selectedUserId = userId;
    currentOffset = 0;
    document.getElementById("chatWindow").innerHTML = '';
    document.getElementById("chatWithLabel").textContent = `Chat with ${username}`;
    showChatSection();
    loadMessages(userId);
    setupScroll(userId);
}

function setupChatForm() {
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevents page reload
        const content = chatInput.value.trim();
        if (content && selectedUserId) {
            sendMessage(selectedUserId, content);
            chatInput.value = ""; // Clear input after sending
        }
    });

    chatInput.addEventListener("input", () => {
        sendTypingSignal();
    });
}

// Expose functions globally
window.showChatSection = showChatSection;
window.returnToPosts = returnToPosts;
window.loadAndInitChat = loadAndInitChat;
