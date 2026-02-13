// src/content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_CLEAN_CONTENT") {
    
    // 1. Remove paywalls visíveis antes de processar
    const overlays = document.querySelectorAll('[class*="paywall"], [id*="paywall"], .subscription-modal');
    overlays.forEach(el => el.remove());

    // 2. Clonamos o documento para não estragar a página que o usuário está vendo
    const documentClone = document.cloneNode(true);
    
    // 3. Usamos a biblioteca Readability (ela deve estar carregada no manifest)
    // Nota: O objeto 'Readability' virá do arquivo Readability.js incluído
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (article) {
      sendResponse({
        title: article.title,
        url: window.location.href,
        content: article.textContent, // Texto limpo para a IA
        html: article.content,        // HTML limpo para o Modo Leitura
        excerpt: article.excerpt,     // Um pequeno resumo do próprio site
        byline: article.byline        // Autor
      });
    } else {
      sendResponse(null);
    }
  }
  return true;
});
