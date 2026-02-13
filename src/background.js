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

// src/background.js

// ... (mantenha as regras declarativeNetRequest e o listener de save como estão)

// 2. NOVA Função de Fallback (SUBSTITUINDO TXTIFY E 12FT)
function getFallbackURL(url, method) {
  // Remove qualquer prefixo de burladores antigos se houver
  const cleanUrl = url.replace(/^https?:\/\/(12ft\.io|txtify\.it)\//, "");

  switch(method) {
    case 'google_cache':
      return `https://webcache.googleusercontent.com/search?q=cache:${cleanUrl}`;
    
    case 'archive':
      return `https://archive.is/latest/${cleanUrl}`;
    
    case 'smry':
    default:
      // O Smry.ai é atualmente a alternativa mais sólida ao 12ft
      return `https://smry.ai/proxy?url=${encodeURIComponent(cleanUrl)}`;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... (mantenha o código de SAVE_ARTICLE_LOCAL)

  if (message.type === "TRY_FALLBACK") {
    // Agora tentamos o Smry primeiro, que é visualmente mais limpo
    const nextUrl = getFallbackURL(message.url, message.method || 'smry');
    chrome.tabs.create({ url: nextUrl });
  }
});
