// 1. Função para limpar obstáculos visuais
function killPaywalls() {
  const badElements = [
    '[class*="paywall"]', '[id*="paywall"]', 
    '.modal-overlay', '.subscription-gate',
    '.tp-modal', '.tp-backdrop', '#falken-paywall' // Adicionando seletores comuns no Brasil
  ];
  badElements.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Destrava o scroll da página
  document.body.style.setProperty("overflow", "auto", "important");
  document.documentElement.style.setProperty("overflow", "auto", "important");
}

// 2. Escuta as mensagens do Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_CLEAN_CONTENT") {
    
    // Primeiro, limpamos o que estiver na frente
    killPaywalls();

    // Clonamos o documento para o Readability processar em "off-screen"
    const docClone = document.cloneNode(true);
    
    // Usamos a biblioteca (ela deve estar carregada antes deste script no manifest)
    const reader = new Readability(docClone);
    const article = reader.parse();

    if (article) {
      sendResponse({
        title: article.title,
        content: article.textContent, // Para IA e busca
        html: article.content,        // Para o Modo Leitura visual
        url: window.location.href,
        excerpt: article.excerpt
      });
    } else {
      // Caso a biblioteca falhe, enviamos um fallback simples
      sendResponse({
        title: document.title,
        content: document.body.innerText.substring(0, 1000),
        url: window.location.href
      });
    }
  }
  return true; // Mantém o canal aberto para processamento assíncrono
});
