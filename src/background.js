// src/background.js

// 1. Mensagem de instalação
chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI: Instalado e operando localmente.");
});

// 2. Listener para gerenciar salvamento local
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_ARTICLE_LOCAL") {
    
    // Recupera o que já existe no storage local
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      
      // Adiciona o novo artigo ao início da lista
      articles.unshift({
        ...message.data,
        id: crypto.randomUUID(), // Gera um ID único para cada artigo
        savedAt: new Date().toISOString()
      });

      // Limita a 50 artigos no plano grátis (opcional, para incentivar o Pro futuro)
      const limitedArticles = articles.slice(0, 50);

      chrome.storage.local.set({ savedArticles: limitedArticles }, () => {
        console.log("Artigo salvo localmente:", message.data.title);
        sendResponse({ success: true });
      });
    });
    
    return true; // Mantém o canal aberto para o sendResponse
  }
});
