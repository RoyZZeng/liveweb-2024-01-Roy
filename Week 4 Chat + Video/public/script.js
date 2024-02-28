document.addEventListener("DOMContentLoaded", function() {
    const sendButton = document.querySelector('#submit');
    const chatInput = document.querySelector('#message');
    const chatBody = document.querySelector('.chat-body');

    sendButton.addEventListener('click', function() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = messageText;
            chatBody.appendChild(messageElement);
            chatInput.value = ''; // empty chatInput message
            chatBody.scrollTop = chatBody.scrollHeight; // scroll to the new message
        }
    });
});
