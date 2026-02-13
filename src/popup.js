// src/popup.js

document.getElementById('btn-save').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusEl = document.getElementById('status');
    statusEl.innerText = "Limpando barreira...";

    chrome.tabs.sendMessage(tab.id, { action: "GET_CLEAN_CONTENT" }, (response) => {
        if (response && response.status === "success" && response.data.content.length > 500) {
            chrome.runtime.sendMessage({ type: "SAVE_ARTICLE_LOCAL", data: response.data }, (res) => {
                statusEl.innerText = "Salvo com sucesso! ✨";
            });
        } else {
            // Se falhar localmente, usa o SMRY
            statusEl.innerText = "Bloqueio de servidor. Abrindo bypass...";
            chrome.runtime.sendMessage({ 
                type: "TRY_FALLBACK", 
                url: tab.url, 
                method: 'smry' 
            });
        }
    });
});

document.getElementById('btn-force-text').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Força o Google Cache diretamente
    chrome.runtime.sendMessage({ 
        type: "TRY_FALLBACK", 
        url: tab.url, 
        method: 'google_cache' 
    });
});

document.getElementById('btn-force-text').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // BOTÃO MANUAL: Força o Google Cache (o "tanque de guerra")
    statusEl.innerText = "Forçando Cache do Google...";
    chrome.runtime.sendMessage({ 
        type: "TRY_FALLBACK", 
        url: tab.url, 
        method: 'google_cache' 
    });
});

document.getElementById('btn-open-library').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard.html' });
});
