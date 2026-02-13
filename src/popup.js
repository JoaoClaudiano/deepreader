document.getElementById('btn-save').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.innerText = "Extraindo conteúdo...";

  // 1. Pega a aba atual
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 2. Envia mensagem para o content.js extrair os dados
  chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTENT" }, (response) => {
    if (response) {
      status.innerText = "Enviando para o Firebase...";
      
      // 3. Envia para o background.js salvar na nuvem
      chrome.runtime.sendMessage({ 
        type: "SAVE_TO_FIREBASE", 
        data: response 
      }, (res) => {
        if (res.success) {
          status.innerText = "Salvo com sucesso! ✨";
        }
      });
    }
  });
});
