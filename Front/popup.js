document.addEventListener('DOMContentLoaded', function() {
    // Get the current tab's URL and update the link
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let tab = tabs[0];
      let link = document.getElementById('current-link');
      if (!tab || !tab.url) {
        link.href = '#';
        link.textContent = 'Cannot get current tab information';
      } else if (tab.url.startsWith('chrome://')) {
        link.href = '#';
        link.textContent = 'Cannot display this URL';
      } else {
        link.href = tab.url;
        link.textContent = tab.url;
      }
    });
  
    // Handle the chat send button click
    document.getElementById('send-btn').addEventListener('click', function() {
      let chatInput = document.getElementById('chat-input').value.trim();
      if (chatInput) {
        saveChatMessage(chatInput); // Save the chat message
        console.log('Chat message:', chatInput);
        document.getElementById('chat-input').value = ''; // Clear the input field
      }
    });
  
    // Function to save chat message
    function saveChatMessage(message) {
      chrome.storage.local.get({ messages: [] }, function(data) {
        let messages = data.messages;
        messages.push(message);
        chrome.storage.local.set({ messages: messages }, function() {
          console.log('Message saved:', message);
        });
      });
    }
  });
  