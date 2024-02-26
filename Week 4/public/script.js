document.addEventListener("DOMContentLoaded", function() {
    
    const sendButton = document.querySelector('.send-button');
    const chatInput = document.querySelector('.chat-input');
    const chatBody = document.querySelector('.chat-body');

    sendButton.addEventListener('click', function() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = messageText;
            chatBody.appendChild(messageElement);
            chatInput.value = ''; // 清空输入框
            chatBody.scrollTop = chatBody.scrollHeight; // 滚动到最新消息
        }
    });


    
    var socket = io.connect();
    // Listen for the submit button click event to send a message
    document.getElementById('submit').addEventListener('click', function() {
        let messageInput = document.getElementById('chat-input');
        let message = messageInput.value.trim();
        if (message) {
            socket.emit('chatmessage', { message: message });
            messageInput.value = '';
        }
    });

    // Listen for incoming messages to display them in the chat body
    socket.on('chatmessage', function (data) {
        let chatBody = document.getElementById('chat-body');
        let newMessageDiv = document.createElement('div');
        newMessageDiv.classList.add('message');
        newMessageDiv.textContent = data.message;
        chatBody.appendChild(newMessageDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the new message
    });


});


    
