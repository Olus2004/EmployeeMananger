// AI Chat Widget Logic
let isChatbotOpen = false;
let isWaitingForAi = false;

function toggleAiChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    // Also remove the notification dot ping when opened
    const pingDot = document.querySelector('#aiChatToggleBtn .animate-ping');
    if(pingDot) pingDot.style.display = 'none';

    isChatbotOpen = !isChatbotOpen;
    if (isChatbotOpen) {
        chatWindow.classList.remove('hidden');
        document.getElementById('aiChatInput').focus();
    } else {
        chatWindow.classList.add('hidden');
    }
}

// Auto-resize textarea logic
document.addEventListener('DOMContentLoaded', () => {
    const aiChatInput = document.getElementById('aiChatInput');
    if(aiChatInput) {
        aiChatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if(this.value.trim() === '') this.style.height = 'auto'; // reset
        });

        // Trigger send on Enter (shift+enter for new line)
        aiChatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAiMessage();
            }
        });
    }
});

function _formatText(text) {
    // Escape HTML to prevent XSS
    let escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Convert newlines to <br>
    escaped = escaped.replace(/\n/g, "<br>");
    
    // Very basic markdown bold parsing
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return escaped;
}

function appendMessage(sender, text) {
    const messagesArea = document.getElementById('aiChatMessages');
    const msgDiv = document.createElement('div');
    
    const formattedText = _formatText(text);
    
    if (sender === 'user') {
        msgDiv.className = 'flex items-start justify-end w-full';
        msgDiv.innerHTML = `
            <div class="bg-slate-800 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[85%] leading-relaxed">
                ${formattedText}
            </div>
        `;
    } else {
        msgDiv.className = 'flex items-start w-full';
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 flex-shrink-0 mt-1 shadow-sm">
                <i class="fas fa-robot text-xs"></i>
            </div>
            <div class="bg-white border border-slate-200/60 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 shadow-sm max-w-[85%] leading-relaxed">
                ${formattedText}
            </div>
        `;
    }
    
    msgDiv.style.opacity = '0';
    msgDiv.style.transform = 'translateY(10px)';
    msgDiv.style.transition = 'all 0.3s ease';
    
    messagesArea.appendChild(msgDiv);
    
    // Trigger animation
    requestAnimationFrame(() => {
        msgDiv.style.opacity = '1';
        msgDiv.style.transform = 'translateY(0)';
    });
    
    // Smooth scroll down
    messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
}

function appendTypingIndicator() {
    const messagesArea = document.getElementById('aiChatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.id = 'aiTypingIndicator';
    msgDiv.className = 'flex items-start w-full';
    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 flex-shrink-0 mt-1 shadow-sm">
            <i class="fas fa-robot text-xs"></i>
        </div>
        <div class="bg-white border border-slate-200/60 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] flex items-center space-x-1.5">
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
            <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
        </div>
    `;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
}

function removeTypingIndicator() {
    const indicator = document.getElementById('aiTypingIndicator');
    if (indicator) indicator.remove();
}

async function sendAiMessage() {
    if (isWaitingForAi) return;
    
    const inputEl = document.getElementById('aiChatInput');
    const message = inputEl.value.trim();
    if (!message) return;
    
    // Clear input
    inputEl.value = '';
    inputEl.style.height = 'auto'; // reset textarea height
    
    // Append User message
    appendMessage('user', message);
    
    isWaitingForAi = true;
    const sendBtn = document.getElementById('aiChatSendBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-sm text-slate-400"></i>';
    
    appendTypingIndicator();
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (response.ok && data && data.reply) {
            appendMessage('bot', data.reply);
        } else {
            console.error('AI Error response:', data);
            appendMessage('bot', '⚠️ Lỗi: ' + (data?.errorMessage || response.statusText || 'AI Gateway từ chối truy cập.'));
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('AI Chat Error:', error);
        appendMessage('bot', '⚠️ Rất tiếc, AI đang offline hoặc Server /api/ai/chat không phản hồi. (Chưa khởi chạy ./Employee.API hoặc lỗi port)');
    } finally {
        isWaitingForAi = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane text-sm"></i>';
        inputEl.focus();
    }
}
