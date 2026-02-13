// src/background.js
// 1. Bloqueio de Scripts de Paywall (DNR)
const paywallRules = [
  { "id": 1, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*static/js/paywall*", "resourceTypes": ["script"] } },
  { "id": 2, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*tinypass.com*", "resourceTypes": ["script"] } },
  { "id": 3, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*piano.io*", "resourceTypes": ["script"] } }
];

chrome.declarativeNetRequest.updateDynamicRules({
  addRules: paywallRules,
  removeRuleIds: [1, 2, 3]
});

// 2. Função de Fallback (REMOVIDO 12FT QUE DÁ ERRO)
function getFallbackURL(url, method) {
  if (method === 'google_cache') {
    return `https://webcache.googleusercontent.com/search?q=cache:${url}`;
  }
  if (method === 'archive') {
    return `https://archive.is/latest/${url}`;
  }
  // Padrão: Txtify (Mais estável para jornais brasileiros)
  return `https://txtify.it/${url.replace(/^https?:\/\//, '')}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_ARTICLE_LOCAL") {
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      articles.unshift({ ...message.data, id: Date.now().toString(), savedAt: new Date().toISOString() });
      chrome.storage.local.set({ savedArticles: articles.slice(0, 50) }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  // Se o conteúdo falhar, tentamos a técnica seguinte
  if (message.type === "TRY_FALLBACK") {
    const nextUrl = getFallbackURL(message.url, message.method);
    chrome.tabs.create({ url: nextUrl });
  }
});
