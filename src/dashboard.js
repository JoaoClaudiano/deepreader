document.addEventListener('DOMContentLoaded', () => {
    renderArticles();
});

function renderArticles() {
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
        const list = document.getElementById('articles-list');
        const emptyState = document.getElementById('empty-state');
        const stats = document.getElementById('stats');
        
        list.innerHTML = '';
        const articles = result.savedArticles.reverse(); // Mais novos primeiro

        stats.innerText = `${articles.length} artigos salvos`;

        if (articles.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        articles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = "article-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition relative";
            
            card.innerHTML = `
                <div>
                    <h2 class="font-bold text-lg mb-2 line-clamp-2">${article.title}</h2>
                    <p class="text-gray-500 text-sm mb-4">${new URL(article.url).hostname}</p>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <button onclick="viewArticle(${index})" class="text-blue-600 font-semibold hover:underline">Ler agora →</button>
                    <button onclick="deleteArticle(${index})" class="delete-btn opacity-0 text-red-400 text-xs hover:text-red-600 transition">Excluir</button>
                </div>
            `;
            list.appendChild(card);
        });
    });
}

// Funções globais para os botões
window.viewArticle = (index) => {
    // Aqui poderíamos abrir um modal ou uma página de leitura limpa
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
        const article = result.savedArticles.reverse()[index];
        alert("Modo Leitura para: " + article.title + "\n\nConteúdo: " + article.content.substring(0, 300) + "...");
    });
};

window.deleteArticle = (index) => {
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
        let articles = result.savedArticles.reverse();
        articles.splice(index, 1);
        articles.reverse(); // Volta para a ordem original antes de salvar
        chrome.storage.local.set({ savedArticles: articles }, () => {
            renderArticles();
        });
    });
};
