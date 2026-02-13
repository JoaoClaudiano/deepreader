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

// Adicione um listener para um botão "Ver Meus Artigos"
document.getElementById('btn-open-library').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard.html' });
});

