// src/background.js

// 1. Mensagem de instalação e proteção
chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Instalado e Proteção de Scripts Ativada.");
});

// 2. Bloqueio Robusto e Dinâmico de Scripts de Paywall
// IDs 1-3 para regras fixas, 100-102 para garantir cobertura de domínios específicos
const paywallRules = [
  {
    "id": 1,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "*static/js/paywall*", // Alvo: O Povo Mais
      "resourceTypes": ["script"]
    }
  },
  {
    "id": 2,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "*tinypass.com*", // Alvo: Piano/Estadão/Gazeta
      "resourceTypes": ["script"]
    }
  },
  {
    "id": 3,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "*piano.io*",
      "resourceTypes": ["script"]
    }
  }
];

chrome.declarativeNetRequest.updateDynamicRules({
  addRules: paywallRules,
  removeRuleIds: [1, 2, 3]
});

// 3. Listener Único para Gerenciamento de Salvamento Local
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_ARTICLE_LOCAL") {
    
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      
      // Criação do novo registro
      const newArticle = {
        ...message.data,
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
        savedAt: new Date().toISOString()
      };

      articles.unshift(newArticle);

      // Limita a 50 artigos no storage
      const limitedArticles = articles.slice(0, 50);

      chrome.storage.local.set({ savedArticles: limitedArticles }, () => {
        console.log("Artigo salvo localmente:", message.data?.title);
        sendResponse({ success: true });
      });
    });
    
    return true; // Mantém o canal aberto para a resposta assíncrona
  }
});
