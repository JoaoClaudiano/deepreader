// Função para remover overlays de paywall comuns
function killPaywalls() {
  const badElements = [
    '[class*="paywall"]', '[id*="paywall"]', 
    '.modal-overlay', '.subscription-gate'
  ];
  badElements.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
  document.body.style.overflow = 'auto';
}

// Escuta mensagens do Popup para ativar o Modo Leitura
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_CONTENT") {
    killPaywalls();
    
    // Captura o título e o corpo do texto
    const title = document.title;
    const content = document.body.innerText; // Simples para o MVP
    
    sendResponse({ title, content, url: window.location.href });
  }
});
