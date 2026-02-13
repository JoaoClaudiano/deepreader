// src/popup.js

document.getElementById('btn-save').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusEl = document.getElementById('status');
    statusEl.innerText = "Analisando página...";

    chrome.tabs.sendMessage(tab.id, { action: "GET_CLEAN_CONTENT" }, (response) => {
        if (response && response.status === "success") {
            // Caso 1: Sucesso na extração local
            chrome.runtime.sendMessage({ type: "SAVE_ARTICLE_LOCAL", data: response.data }, (res) => {
                statusEl.innerText = "Salvo localmente! ✨";
            });
        } else {
            // Caso 2: Conteúdo bloqueado pelo servidor (Cascata de Fallback)
            statusEl.innerText = "Conteúdo bloqueado. Tentando técnica alternativa...";
            
            // Inicia cascata: primeiro tenta o Txtify (mais rápido)
            chrome.runtime.sendMessage({ 
                type: "TRY_FALLBACK", 
                url: tab.url, 
                method: 'txtify' 
            });
        }
    });
});

document.getElementById('btn-force-text').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Botão manual agora tenta o Google Cache (o mais forte)
    chrome.runtime.sendMessage({ type: "TRY_FALLBACK", url: tab.url, method: 'google_cache' });
});

document.getElementById('btn-open-library').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard.html' });
});
