// src/background.js

// 1. Mensagem de instalação
chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Instalado e operando localmente.");
});

// 2. Bloqueio dinâmico de Scripts de Paywall (Estratégia para O Povo, Estadão, etc)
// Isso impede que os scripts que "trancam" a tela sejam baixados
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      "id": 100,
      "priority": 2,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "*tinypass.com*",
        "resourceTypes": ["script"]
      }
    },
    {
      "id": 101,
      "priority": 2,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "*piano.io*",
        "resourceTypes": ["script"]
      }
    },
    {
      "id": 102,
      "priority": 2,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "mais.opovo.com.br/static/js/paywall*", 
        "resourceTypes": ["script"]
      }
    }
  ],
  removeRuleIds: [100, 101, 102]
});

// 3. Listener para gerenciar salvamento local
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_ARTICLE_LOCAL") {
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      
      articles.unshift({
        ...message.data,
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
        savedAt: new Date().toISOString()
      });

      const limitedArticles = articles.slice(0, 50);

      chrome.storage.local.set({ savedArticles: limitedArticles }, () => {
        console.log("Artigo salvo localmente:", message.data?.title);
        sendResponse({ success: true });
      });
    });
    return true; 
  }
});
