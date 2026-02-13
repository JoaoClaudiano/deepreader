// 1. Função para limpar obstáculos visuais
// src/content.js
// Limpa cookies do lado do cliente para confundir o rastreamento local

// Impede que scripts do site detectem modificações no DOM por alguns segundos
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
                if (node.className && typeof node.className === 'string' && node.className.includes('paywall')) {
                    node.remove();
                }
            });
        }
    });
});
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
observer.observe(document.documentElement, { childList: true, subtree: true });
function killPaywalls() {
    // 1. Remove os overlays e bloqueios específicos
    const selectors = [
        '[class*="paywall"]', '[id*="paywall"]', 
        '.modal-overlay', '.subscription-gate',
        '.premium-content-lock', '.tp-modal', '.tp-backdrop',
        '#falken-paywall', '.v-overlay', '.v-dialog' // Seletores comuns em portais do NE
    ];
    
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.remove();
        });
    });

    // 2. Destrava o corpo da página e garante que o texto apareça
    const bodies = [document.body, document.documentElement];
    bodies.forEach(el => {
        el.style.setProperty("overflow", "auto", "important");
        el.style.setProperty("position", "relative", "important");
    });

    // 3. Algumas páginas escondem o conteúdo via CSS (ex: Opovo Mais)
    // Tentamos forçar a visibilidade de elementos de texto que podem estar ocultos
    document.querySelectorAll('.texto-conteudo, .materia-conteudo, article').forEach(el => {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("opacity", "1", "important");
    });
}

// Executa a limpeza imediatamente ao carregar e também por mensagem
killPaywalls();
// Opcional: repetir a limpeza após 2 segundos (caso o script do site demore a rodar)
setTimeout(killPaywalls, 2000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_CLEAN_CONTENT") {
        killPaywalls();
        
        const docClone = document.cloneNode(true);
        const reader = new Readability(docClone);
        const article = reader.parse();

        if (article) {
            sendResponse(article);
        } else {
            // Fallback: se o Readability falhar, pegamos o conteúdo bruto
            sendResponse({
                title: document.title,
                content: document.body.innerText,
                url: window.location.href
            });
        }
    }
    return true;
});

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
