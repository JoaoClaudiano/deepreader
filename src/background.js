// src/background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Proteção de Scripts e Sistema de Cascata Ativados.");
});

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

// 2. Sistema de Cascata de Redirecionamento (Fallback)
function getFallbackURL(url, type) {
  switch(type) {
    case 'txtify': return `https://txtify.it/${url}`;
    case 'google_cache': return `https://webcache.googleusercontent.com/search?q=cache:${url}`;
    case 'archive': return `https://archive.is/latest/${url}`;
    case '12ft': return `https://12ft.io/${url}`;
    default: return `https://txtify.it/${url}`;
  }
}

// 3. Gerenciamento de Mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Salvar Artigo
  if (message.type === "SAVE_ARTICLE_LOCAL") {
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      const newArticle = {
        ...message.data,
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
        savedAt: new Date().toISOString()
      };
      articles.unshift(newArticle);
      chrome.storage.local.set({ savedArticles: articles.slice(0, 50) }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  // Acionar Cascata Manual
  if (message.type === "TRY_FALLBACK") {
    const nextUrl = getFallbackURL(message.url, message.method);
    chrome.tabs.create({ url: nextUrl });
  }
});
