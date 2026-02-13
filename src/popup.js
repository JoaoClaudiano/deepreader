// src/popup.js

document.getElementById('btn-save').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusEl = document.getElementById('status');
    statusEl.innerText = "Limpando barreira...";

    chrome.tabs.sendMessage(tab.id, { action: "GET_CLEAN_CONTENT" }, (response) => {
        // Verifica se o Readability conseguiu extrair algo substancial
        // Se o texto tiver menos de 500 caracteres, o paywall barrou no servidor
        if (response && response.status === "success" && response.data.content.length > 500) {
            chrome.runtime.sendMessage({ type: "SAVE_ARTICLE_LOCAL", data: response.data }, (res) => {
                statusEl.innerText = "Salvo com sucesso! ✨";
            });
        } else {
            // CASCATA AUTOMÁTICA: Se falhar localmente, vai para o Txtify
            statusEl.innerText = "Bloqueio detectado. Abrindo Modo Texto...";
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
