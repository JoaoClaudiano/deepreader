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
// src/background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Proteção de Scripts Ativada.");
});

// Bloqueio Robusto de Scripts de Paywall
const rules = [
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
  addRules: rules,
  removeRuleIds: [1, 2, 3]
});

// Listener de Salvamento Local (Mantido conforme solicitado)
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
});
