const API_KEY = "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"; 
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

let chats = []; 
let currentChatId = null;

const historyList = document.getElementById('chat-history-list');
const output = document.getElementById('chat-messages');
const input = document.getElementById('ai-input');
const titleDisplay = document.getElementById('chat-title-display');
const titleInput = document.getElementById('chat-title-input');

function createNewChat() {
    const id = Date.now();
    const newChat = {
        id: id,
        title: `Eksperimen ${chats.length + 1}`,
        messages: []
    };
    chats.push(newChat);
    renderHistory();
    switchChat(id);
}

function renderHistory() {
    historyList.innerHTML = '';
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
        item.innerText = chat.title;
        item.onclick = () => switchChat(chat.id);
        historyList.appendChild(item);
    });
}

function switchChat(id) {
    currentChatId = id;
    renderHistory();
    output.innerHTML = '';
    const activeChat = chats.find(c => c.id === id);
    if (activeChat) {
        titleDisplay.innerText = activeChat.title;
        activeChat.messages.forEach(msg => {
            appendLine(msg.text, msg.role === 'user' ? '#fff' : '#00ffff', msg.role === 'user' ? 'STEVEN' : 'AI');
        });
    }
}

// Rename Kapsul Tanpa Notifikasi Sistem
function enableRenameMode() {
    if (!currentChatId) return;
    titleDisplay.style.display = 'none';
    titleInput.style.display = 'inline-block';
    titleInput.value = titleDisplay.innerText;
    titleInput.focus();
    titleInput.onkeydown = (e) => { if (e.key === 'Enter') saveTitle(); };
    titleInput.onblur = saveTitle;
}

function saveTitle() {
    const chat = chats.find(c => c.id === currentChatId);
    if (titleInput.value.trim() !== "") {
        chat.title = titleInput.value.trim();
        titleDisplay.innerText = chat.title;
        renderHistory();
    }
    titleInput.style.display = 'none';
    titleDisplay.style.display = 'inline-block';
}

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
        if (!currentChatId) createNewChat();
        executeTask(input.value.trim());
        input.value = '';
    }
});

async function executeTask(msg) {
    const chat = chats.find(c => c.id === currentChatId);
    chat.messages.push({ role: 'user', text: msg });
    appendLine(msg, "#fff", "STEVEN");

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{role: "system", content: "Kamu STEVEN AI."}, ...chat.messages.map(m => ({role: m.role, content: m.text}))]
            })
        });
        const data = await res.json();
        const reply = data.choices[0].message.content;
        chat.messages.push({ role: 'assistant', text: reply });
        appendLine(reply, "#00ffff", "AI");
    } catch (e) { console.error("Koneksi bermasalah."); }
}

function appendLine(txt, col, snd) {
    const el = document.createElement('div');
    el.innerHTML = `<span style="color:${col}">[${snd}] ></span> ${txt}`;
    el.style.marginBottom = "20px";
    output.appendChild(el);
    document.getElementById('display-output').scrollTop = document.getElementById('display-output').scrollHeight;
}

createNewChat();
