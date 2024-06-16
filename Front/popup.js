document.addEventListener('DOMContentLoaded', function () {
  initializePopup();

  // Navigation click handlers
  document.getElementById('main-page-link').addEventListener('click', function (event) {
    event.preventDefault();
    console.log('Navigating to Main Page');
    window.location.href = 'popup.html'; // Reloads the popup.html
  });

  document.getElementById('catalogue-link').addEventListener('click', function (event) {
    event.preventDefault();
    console.log('Navigating to Catalogue');
    window.location.href = 'catalogue.html'; // Loads the catalogue.html
  });

  // Handle the chat send button click
  document.getElementById('send-btn').addEventListener('click', function () {
    let chatInput = document.getElementById('chat-input').value.trim();
    if (chatInput) {
      saveChatMessage(chatInput); // Save the chat message
      console.log('Chat message:', chatInput);
      document.getElementById('chat-input').value = ''; // Clear the input field
      sendMessageToServer(chatInput); // Send the message to the server
      runThread();
    }
  });
});

function runThread() {
  let serverIp = "http://localhost:3000";
  let endpoint = "/thread";
  let thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";

  fetch(`${serverIp}${endpoint}/${thread_id}/run`, {
    method: "POST"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

}

function sendMessageToServer(message) {
  let serverIp = "http://localhost:3000";
  let endpoint = "/thread";
  let thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";
  let requestBody = { "message": message };

  fetch(`${serverIp}${endpoint}/${thread_id}/message`, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

}

function initializePopup() {
  // Get the current tab's URL and update the link
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    let link = document.getElementById('current-link');

    if (!link) {
      console.error('Current link element is missing');
      return;
    }

    if (!tab || !tab.url) {
      link.href = '#';
      link.textContent = 'Cannot get current tab information';
    } else if (tab.url.startsWith('chrome://')) {
      link.href = '#';
      link.textContent = 'Cannot display this URL';
    } else {
      link.href = tab.url;
      link.textContent = tab.url;
      let currentTabUrl = tab.url;
      console.log('Current tab URL:', currentTabUrl);

      sendTabUrlToServer(currentTabUrl);
    }
  });
}

function sendTabUrlToServer(currentTabUrl) {
  let serverIp = "http://localhost:3000";
  let endpoint = "/source";
  let thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";
  let requestBody = { "source_url": currentTabUrl };

  fetch(`${serverIp}${endpoint}/${thread_id}`, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

}

function saveChatMessage(message) {
  let chatZone = document.getElementById('chat-zone');

  if (!chatZone) {
    console.error('Chat zone element is missing');
    return;
  }

  let chatMessage = document.createElement('div');
  chatMessage.className = 'chat-message user';
  chatMessage.textContent = message;

  chatZone.appendChild(chatMessage);
  chatZone.scrollTop = chatZone.scrollHeight; // Scroll to the bottom
}

function retrieveThreadMessages() {
  let serverIp = "http://localhost:3000";
  let endpoint = "/thread";
  let thread_id = "thread_T4e3FqCxs0KCfcadzYGUZHjb";

  fetch(`${serverIp}${endpoint}/${thread_id}/messages`, {
    method: "GET"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

}

