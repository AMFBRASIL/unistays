/**
 * Abre o HTML em janela/iframe e dispara impressão preservando estilos embutidos.
 */
export function printHtmlDocument(html: string): boolean {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Impressão de contrato');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    document.body.removeChild(iframe);
    return false;
  }

  const cleanup = () => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  };

  const triggerPrint = () => {
    win.focus();
    win.print();
    setTimeout(cleanup, 1500);
  };

  if (doc.readyState === 'complete') {
    setTimeout(triggerPrint, 400);
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 400);
  }

  return true;
}
