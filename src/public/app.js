const loginButton = document.getElementById('login-button');
const loginStatus = document.getElementById('login-status');
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const connectionStatus = document.getElementById('connection-status');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesList = document.getElementById('messages');

let socket;
let popupWindow = null;

loginButton.onclick = () => {
  openLoginPopup();
};

function openLoginPopup() {
  popupWindow = window.open(
    'http://localhost:3500/auth/google',
    'Login',
    'width=600,height=600',
  );

  if (
    !popupWindow ||
    popupWindow.closed ||
    typeof popupWindow.closed == 'undefined'
  ) {
    alert('Please allow popups for this website');
    return;
  }

  window.addEventListener(
    'message',
    (event) => {
      if (event.data === 'login-success') {
        if (popupWindow) {
          popupWindow.close();
        }
        checkLoginStatus();
      }
    },
    false,
  );
}

function checkLoginStatus() {
  fetch('http://localhost:3500/auth/login', {
    method: 'GET',
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.isLoggedIn) {
        loginSuccess(data.user);
      } else {
        loginStatus.textContent = 'Not logged in';
      }
    })
    .catch((error) => {
      console.error('Error checking login status:', error);
      loginStatus.textContent = 'Error checking login status';
    });
}

function loginSuccess(user) {
  loginSection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  loginStatus.textContent = `Logged in as ${user.email}`;
  initializeSocket();
}

function initializeSocket() {
  socket = io('http://localhost:3500', {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    connectionStatus.textContent = 'Connected';
    connectionStatus.style.color = 'green';

    // Log the cookie (which contains the token)
    console.log('Cookie:', document.cookie);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    connectionStatus.textContent = 'Connection Error';
    connectionStatus.style.color = 'red';
  });

  socket.on('message', (message) => {
    const li = document.createElement('li');
    li.textContent = message;
    messagesList.appendChild(li);
  });

  sendButton.onclick = () => {
    if (messageInput.value) {
      socket.emit('message', messageInput.value);
      messageInput.value = '';
    }
  };
}
