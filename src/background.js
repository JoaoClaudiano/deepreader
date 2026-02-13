// src/background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Sistema de Cascata v2 Ativado.");
});

// 1. Regras de Bloqueio (DNR)
const paywallRules = [
  { "id": 1, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*static/js/paywall*", "resourceTypes": ["script"] } },
  { "id": 2, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*tinypass.com*", "resourceTypes": ["script"] } },
  { "id": 3, "priority": 1, "action": { "type": "block" }, "condition": { "urlFilter": "*piano.io*", "resourceTypes": ["script"] } }
];

chrome.declarativeNetRequest.updateDynamicRules({
  addRules: paywallRules,
  removeRuleIds: [1, 2, 3]
});

// 2. Gerenciador de Redirecionamento (A CASCATA)
function getFallbackURL(url, method) {
  // Limpa a URL de qualquer prefixo de burladores antigos
  const cleanUrl = url.replace(/^https?:\/\/12ft\.io\//, "");

  if (method === 'google_cache') {
    return `https://webcache.googleusercontent.com/search?q=cache:${cleanUrl}`;
  }
  if (method === 'archive') {
    return `https://archive.is/latest/${cleanUrl}`;
  }
  // PADRÃO: Txtify.it (O que mais funciona para O Povo e jornais BR)
  return `https://txtify.it/${cleanUrl}`;
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

  if (message.type === "TRY_FALLBACK") {
    const nextUrl = getFallbackURL(message.url, message.method);
    chrome.tabs.create({ url: nextUrl });
  }
});
