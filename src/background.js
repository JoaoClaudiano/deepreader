// Configuração do "Disfarce" de Googlebot via API Declarative Net Request
// Nota: Em produção, isso seria configurado via regras JSON no manifest.

chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepRead AI instalado com sucesso.");
});

// Listener para salvar no Firebase (esquema inicial)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_TO_FIREBASE") {
    // Aqui entra a lógica de autenticação e Firestore
    console.log("Salvando artigo:", message.data.title);
    // Simulação de resposta de sucesso
    sendResponse({ success: true });
  }
  return true;
});
