document.getElementById('btn-save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "GET_CLEAN_CONTENT" }, (articleData) => {
    
    // Pegar o que já está salvo no navegador
    chrome.storage.local.get({ savedArticles: [] }, (result) => {
      const articles = result.savedArticles;
      
      // Adicionar o novo artigo
      articles.push({
        ...articleData,
        date: new Date().toISOString()
      });

      // Salvar de volta no navegador do usuário
      chrome.storage.local.set({ savedArticles: articles }, () => {
        document.getElementById('status').innerText = "Salvo localmente! ✨";
      });
    });
  });
});

// Listener para um botão "Ver Meus Artigos"
document.getElementById('btn-open-library').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard.html' });
});

// INCREMENTO: Modo Texto Puro com Múltiplas Técnicas
document.getElementById('btn-force-text').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    
    // Técnica 1: Txtify (Melhor para textos e ignorar JS bloqueador)
    const txtifyUrl = `https://txtify.it/${url}`;
    
    // Técnica 2: Google Web Cache (Ótimo para burlar Paywall de redirecionamento)
    const googleCacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${url}`;

    // Técnica 3: Archive.is (O "tanque de guerra" que abre quase tudo)
    const archiveUrl = `https://archive.is/latest/${url}`;

    // Ação: Abre o Txtify por padrão, que é o mais rápido e limpo
    // Mas você pode mudar para o Archive se preferir o mais potente
    chrome.tabs.create({ url: txtifyUrl });
});
