// chat.js
let loggedInUserId = null;
let selectedUserId = null;
let typingTimeout = null;
let currentOffset = 0;
let throttle = false;
;
let Theirname;

const chatMain = document.getElementById("chat-main");
const chatWindow = document.getElementById("chatWindow");
const openChatButton = document.getElementById('openChatButton');
const unreadMessages = new Set();
const closeChatBtn = document.getElementById("closeChatBtn");

let socket;


function fetchUserList() {
  fetch("/get-users", {
    method: "GET",
    credentials: "include",
  })
    .then(response => {
      switch (response.status) {
        case 401:
          errorPage(401); // Handle unauthorized access
          return;
        case 403:
          errorPage(403); // Handle forbidden access
          return;
        case 404:
          errorPage(404);
          return;
        case 405:
          errorPage(405);
          return;
        case 500:
          errorPage(500);
          return;
        default:
          break;
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((users) => {
      const userList = document.getElementById("userList");
      userList.innerHTML = "";

      if (users == null) {

        return;
      } else {
        users.forEach((user) => {
          if (user.id !== loggedInUserId) {
            const li = document.createElement("li");
            li.dataset.userId = user.id;
            li.classList.add("user-item");
            // if this user has unread messages and you’re not in that chat, highlight
            if (unreadMessages.has(user.id) && user.id !== selectedUserId) {
              li.style.backgroundColor = "lightblue";
            }
            // Create username span
            const usernameSpan = document.createElement("span");
            usernameSpan.textContent = user.username;

            // Create status dot
            const statusDot = document.createElement("span");
            statusDot.classList.add("status-dot");
            statusDot.classList.add(user.online ? "online" : "offline");

            // Append elements
            li.appendChild(usernameSpan);
            li.appendChild(statusDot);
            if (user.online === true) {
              li.onclick = () => openChatWith(user.id, user.username);
            }
            userList.appendChild(li);
          } else {
            console.log("My username:", Chatusername);
          }
        });
      }
    })
    .catch((err) => console.log(err));
}

function setupChatForm() {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = chatInput.value.trim();
    if (content && selectedUserId) {

      sendMessage(selectedUserId, content);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      chatInput.value = ""; // Clear input after sending
    }
  });

  chatInput.addEventListener("input", () => {
    sendTypingSignal();
  });
}


function loadMessages(withId, offset = 0) {

  fetch(`/messages?with=${withId}&offset=${offset}`, { credentials: "include" })
    .then((res) => res.json())
    .then((messages) => {
      if (!messages || !Array.isArray(messages)) {
        console.warn("No messages received or invalid format.");
        return;
      }

      messages.forEach((msg) => prependMessageToChat(msg));
      throttle = false;
    })
    .catch((err) => console.log(err));
}

function prependMessageToChat(msg) {
  const container = document.getElementById("chatWindow");
  const node = document.createElement("div");
  node.classList.add("chat-message");

  console.log("session user in prepend msg: ", usernameFromSession);
  if (msg.from === loggedInUserId) {
    node.classList.add("my-message");
    node.innerHTML = `<strong>${usernameFromSession}</strong> <strong>${new Date(
      msg.timestamp
    ).toLocaleString()}:</strong><br> ${msg.content}`;
  } else {
    node.classList.add("received-message");
    node.innerHTML = `<strong>${Theirname}</strong> <strong>${new Date(
      msg.timestamp
    ).toLocaleString()}:</strong><br> ${msg.content}`;
  }

  // Insert the new message at the top
  container.insertBefore(node, container.firstChild);
}

function updateUserStatus(username, status) {
  const userList = document
    .getElementById("userList")
    .getElementsByTagName("li");
  for (let li of userList) {
    const userItem = li.querySelector(".username");
    if (userItem && userItem.textContent === username) {
      const statusDot = li.querySelector(".status-dot");
      if (status === "online") {
        statusDot.classList.add("online");
        statusDot.classList.remove("offline");
      } else {
        statusDot.classList.add("offline");
        statusDot.classList.remove("online");
      }
      break;
    }
  }
}

function openChatWith(userId, username) {
  // groupContainer.setAttribute("hidden", "true");
  chatMain.style.display = "block";
  Theirname = username;
  selectedUserId = userId;
  const li = document.querySelector(
    `#userList li[data-user-id="${userId}"]`
  );
  if (li) li.style.backgroundColor = "";

  currentOffset = 0;
  chatWindow.style.display = "flex";
  chatWindow.innerHTML = "";
  document.getElementById(
    "chatWithLabel"
  ).textContent = `Chat with ${username}`;

  // mark their messages as “read” and remove the highlight
  unreadMessages.delete(userId);
  // since fetchUserList runs frequently, we’ll just clear style on this one <li>
  if (li) li.style.backgroundColor = "";

  loadMessages(userId);
  setupScroll(userId);
}

function setupCloseChatBtn() {
  const closeChatBtn = document.getElementById("closeChatButton");
  if (!closeChatBtn) {
    console.warn("⚠️ closeChatButton not found in DOM");
    return;
  }
  closeChatBtn.addEventListener("click", () => {
    // hide the chat panel
    chatMain.style.display = "none";

    document.getElementById("chatWindow").innerHTML = "";
    // mark “no chat open”
    selectedUserId = null;
  });
}

function sendMessage(toId, content) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  console.log("Sending message from:", loggedInUserId);

  const message = {
    type: "message",
    from: loggedInUserId,
    to: toId,
    content: content,
    timestamp: new Date().toISOString(),
  };

  socket.send(JSON.stringify(message));
  appendMessageToChat(message);
}

function sendTypingSignal() {
  if (!socket || !selectedUserId) return;

  const signal = {
    type: "typing",
    from: loggedInUserId,
    username: Chatusername,
    to: selectedUserId,
  };

  socket.send(JSON.stringify(signal));
}

function showTypingIndicator(username) {
  const container = document.getElementById("chatWindow");

  // Check if the typing indicator already exists
  const existingTypingMsg = container.querySelector(".typing-message");
  if (!existingTypingMsg) {
    const typingNode = document.createElement("div");
    typingNode.classList.add("typing-message");
    typingNode.textContent = `${username} is typing...`;
    container.appendChild(typingNode);
    container.scrollTop = container.scrollHeight;
  }

  // Reset the timeout for hiding the indicator
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (existingTypingMsg) {
      existingTypingMsg.remove();
    }
  }, 1000);
}

function appendMessageToChat(msg) {
  const messagesContainer = document.getElementById("chatWindow");
  const newMessage = document.createElement("div");
  newMessage.classList.add("chat-message");

  if (msg.from === loggedInUserId) {
    console.log("msg.from:", usernameFromSession);

    newMessage.classList.add("my-message");
    newMessage.innerHTML = `<strong>${escapeHTML(usernameFromSession)}</strong> <strong>${new Date(
      msg.timestamp
    ).toLocaleString()}:</strong><br> ${escapeHTML(msg.content)}`;
  } else {
    newMessage.classList.add("received-message");
    newMessage.innerHTML = `<strong>${escapeHTML(Theirname)}</strong> <strong>${new Date(
      msg.timestamp
    ).toLocaleString()}:</strong><br> ${escapeHTML(msg.content)}`;
  }

  // Append the new message instead of prepending
  messagesContainer.append(newMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateUserListPeriodically() {
  setInterval(() => {
    fetchUserList();
  }, 300);
}

setupCloseChatBtn();

function loadAndInitChat(userId) {
  loggedInUserId = userId;
  fetchUserList();
  setupChatForm();
  chatWindow.scrollTop = chatWindow.scrollHeight;
  updateUserListPeriodically();
}

function setupScroll(chatUserId) {
  const container = document.getElementsByClassName("chat-window")[0];
  container.addEventListener("scroll", () => {
    if (container.scrollTop === 0 && !throttle) {
      throttle = true;
      currentOffset += 10;
      loadMessages(chatUserId, currentOffset);
      setTimeout(() => {
        throttle = false;
      }, 1500);
    }
  });
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
  history.pushState(null, "", "/posts");
}

if (openChatButton) {
  openChatButton.addEventListener('click', () => {
    checkSession().then(() => {
      loadAndInitChat(userID);
    })
  });
}

function closeChat() {
  chatMain.style.display = "none";
  // groupContainer.setAttribute("hidden", "true");
  document.getElementById("chatWindow").innerHTML = "";
}
// Expose functions globally
window.returnToPosts = returnToPosts;
window.loadAndInitChat = loadAndInitChat;
window.closeChat = closeChat;

