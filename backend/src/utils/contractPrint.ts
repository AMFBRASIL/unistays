/** CSS injetado em templates antigos para preservar cores e layout na impressão. */
export const CONTRACT_PRINT_CSS = `
@page { size: A4; margin: 12mm 14mm; }
html, body {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
@media print {
  html, body {
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .contract-header, .section-title, table.summary-table th {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .intro, table.data-table th, .highlight-box {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`.trim();

export function prepareContractHtmlForPrint(html: string): string {
  const content = html?.trim() || '';
  if (!content) return content;
  if (content.includes('unistays-contract-print')) return content;

  const styleBlock = `<style id="unistays-contract-print">${CONTRACT_PRINT_CSS}</style>`;

  if (content.includes('</head>')) {
    return content.replace('</head>', `${styleBlock}</head>`);
  }

  if (content.includes('<html')) {
    return content.replace(/<html([^>]*)>/i, `<html$1><head><meta charset="UTF-8" />${styleBlock}</head>`);
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  ${styleBlock}
</head>
<body>${content}</body>
</html>`;
}
