// src/popup.js

document.getElementById('btn-save').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusEl = document.getElementById('status');
    statusEl.innerText = "Limpando página...";

    chrome.tabs.sendMessage(tab.id, { action: "GET_CLEAN_CONTENT" }, (response) => {
        // Se a resposta for sucesso e tiver conteúdo real (> 500 caracteres)
        if (response && response.status === "success" && response.data.content.length > 500) {
            chrome.runtime.sendMessage({ type: "SAVE_ARTICLE_LOCAL", data: response.data }, (res) => {
                statusEl.innerText = "Salvo com sucesso! ✨";
            });
        } else {
            // Se falhar (Server-side block), pula para o Txtify imediatamente
            statusEl.innerText = "Bloqueio severo detectado. Usando Txtify...";
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
    // Botão laranja: Força o Google Cache (o mais potente)
    chrome.runtime.sendMessage({ 
        type: "TRY_FALLBACK", 
        url: tab.url, 
        method: 'google_cache' 
    });
});

document.getElementById('btn-open-library').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard.html' });
});
