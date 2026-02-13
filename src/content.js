// src/content.js

// 1. Limpeza de Cookies Cliente
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

function forceClean() {
    const styleId = 'deepread-cleaner-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            html, body { overflow: auto !important; height: auto !important; position: relative !important; }
            * { filter: none !important; opacity: 1 !important; user-select: text !important; -webkit-user-select: text !important; }
            [class*="paywall"], [id*="paywall"], [class*="modal"], [class*="gate"], 
            .tp-backdrop, .modal-overlay, .subscription-gate, .premium-content-lock, 
            .tp-modal, #falken-paywall, .v-overlay, .v-dialog, .paywall-active {
                display: none !important; visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }
    document.body.className = "";
    document.body.style.overflow = "auto";
    
    const contentSelectors = '.materia-conteudo, .texto-conteudo, article, .paywall-content, .entry-content';
    document.querySelectorAll(contentSelectors).forEach(el => {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("max-height", "none", "important");
    });
}

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
                if (node.className && typeof node.className === 'string' && (node.className.includes('paywall') || node.className.includes('modal'))) {
                    node.remove();
                }
            });
        }
    });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

forceClean();
window.addEventListener('load', forceClean);
setTimeout(forceClean, 2000);

// Listener para Extração
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_CLEAN_CONTENT") {
        forceClean();
        try {
            const docClone = document.cloneNode(true);
            const reader = new Readability(docClone);
            const article = reader.parse();

            // Lógica de Detecção de Falha (Se o texto for muito curto, o servidor não enviou a notícia completa)
            const isPartial = article && article.textContent.length < 400;

            if (article && !isPartial) {
                sendResponse({ status: "success", data: article });
            } else {
                sendResponse({ status: "partial", url: window.location.href });
            }
        } catch (e) {
            sendResponse({ status: "error", url: window.location.href });
        }
    }
    return true;
});
