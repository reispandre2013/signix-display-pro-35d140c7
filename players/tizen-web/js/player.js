/**
 * Base Tizen — fluxo UI local.
 * O pareamento real deve usar o mesmo host que o app web (TanStack Start):
 * carregue diretamente a rota /pareamento?platform=tizen nesse host (WebView Tizen ou iframe).
 *
 * Ex.: https://SEU_DOMINIO/pareamento?platform=tizen
 */
(function () {
  const codeEl = document.getElementById("code");
  const statusEl = document.getElementById("status");
  const netEl = document.getElementById("net");

  function setNet() {
    netEl.textContent = navigator.onLine ? "Online" : "Offline";
  }
  setNet();
  window.addEventListener("online", setNet);
  window.addEventListener("offline", setNet);

  codeEl.textContent = "—";
  statusEl.innerHTML =
    "Configure o Tizen para abrir a URL do Signix com <code>?platform=tizen</code> " +
    "(mesmo fluxo que o Android). Este pacote é apenas estrutura e estilos.";
})();
