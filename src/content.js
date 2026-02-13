// src/content.js

// 1. Limpa cookies do lado do cliente para confundir o rastreamento local
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// 2. Função mestre de limpeza (Combinação de forceClean e killPaywalls)
function forceClean() {
    // Remove filtros de Blur (embaçado), Opacidade e trava de Scroll
    const styleId = 'deepread-cleaner-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            html, body { 
                overflow: auto !important; 
                height: auto !important; 
                position: relative !important; 
            }
            * { 
                filter: none !important; 
                opacity: 1 !important; 
                user-select: text !important; 
            }
            [class*="paywall"], [id*="paywall"], [class*="modal"], [class*="gate"], 
            .tp-backdrop, .modal-overlay, .subscription-gate, .premium-content-lock, 
            .tp-modal, #falken-paywall, .v-overlay, .v-dialog {
                display: none !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Remove classes de bloqueio do Body
    document.body.className = "";
    document.body.style.overflow = "auto";
    
    // Força a exibição do texto oculto (O Povo, Estadão, etc)
    const contentSelectors = '.materia-conteudo, .texto-conteudo, article, .paywall-content';
    document.querySelectorAll(contentSelectors).forEach(el => {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("max-height", "none", "important");
        el.style.setProperty("opacity", "1", "important");
    });
}

// 3. MutationObserver para impedir que novos banners surjam após o load
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
                if (node.className && typeof node.className === 'string' && 
                   (node.className.includes('paywall') || node.className.includes('modal'))) {
                    node.remove();
                }
            });
        }
    });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Execuções imediatas e agendadas
forceClean();
window.addEventListener('load', forceClean);
setTimeout(forceClean, 2000);

// 4. Listener Único para Mensagens (Readability + Fallback)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_CLEAN_CONTENT") {
        forceClean();
        
        try {
            const docClone = document.cloneNode(true);
            const reader = new Readability(docClone);
            const article = reader.parse();

            if (article) {
                sendResponse({
                    title: article.title,
                    content: article.textContent,
                    html: article.content,
                    url: window.location.href,
                    excerpt: article.excerpt
                });
            } else {
                throw new Error("Readability falhou");
            }
        } catch (e) {
            // Fallback robusto se a biblioteca falhar
            sendResponse({
                title: document.title,
                content: document.body.innerText.substring(0, 2000),
                url: window.location.href
            });
        }
    }
    return true;
});
