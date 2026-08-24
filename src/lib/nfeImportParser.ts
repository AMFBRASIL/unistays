import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { NFeImportSource, ParsedNFe, ParsedNFeItem } from "@/types/nfeImport";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function textOf(el: Element | null | undefined): string {
  return el?.textContent?.trim() ?? "";
}

function firstByTag(root: Document | Element, tag: string): Element | null {
  const list = root.getElementsByTagName(tag);
  return list.length > 0 ? list[0] : null;
}

function allByTag(root: Document | Element, tag: string): Element[] {
  return Array.from(root.getElementsByTagName(tag));
}

/** Números BR (3.254,07), US/XML (1000000.0000) e mistos (3,254.0700). */
function parseNumber(value: string | undefined | null): number {
  if (!value) return 0;
  let v = value.trim().replace(/\s/g, "");
  if (!v) return 0;

  const hasComma = v.includes(",");
  const hasDot = v.includes(".");

  if (hasComma && hasDot) {
    if (v.lastIndexOf(",") > v.lastIndexOf(".")) {
      v = v.replace(/\./g, "").replace(",", ".");
    } else {
      v = v.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = v.split(",");
    if (parts.length === 2 && parts[1].length <= 4) {
      v = `${parts[0].replace(/\./g, "")}.${parts[1]}`;
    } else {
      v = v.replace(/,/g, "");
    }
  } else if (hasDot) {
    const parts = v.split(".");
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      v = v.replace(/\./g, "");
    }
  }

  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeXmlInput(xmlText: string): string {
  return xmlText
    .replace(/<\--[\s\S]*?-->/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

function cleanEan(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "SEM GTIN" || /^0+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function parseNFeXml(xmlText: string): ParsedNFe {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizeXmlInput(xmlText), "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("XML inválido ou corrompido.");
  }

  const infNFe = firstByTag(doc, "infNFe");
  if (!infNFe) {
    throw new Error("Arquivo XML não parece ser uma NF-e válida (infNFe não encontrado).");
  }

  const ide = firstByTag(infNFe, "ide");
  const emit = firstByTag(infNFe, "emit");
  const total = firstByTag(infNFe, "total");
  const icmsTot = total ? firstByTag(total, "ICMSTot") : null;

  const items: ParsedNFeItem[] = allByTag(infNFe, "det")
    .map((det, index) => {
      const prod = firstByTag(det, "prod");
      if (!prod) return null;

      const qCom = parseNumber(textOf(firstByTag(prod, "qCom")));
      const vUnCom = parseNumber(textOf(firstByTag(prod, "vUnCom")));
      const vProd = parseNumber(textOf(firstByTag(prod, "vProd")));

      return {
        lineNumber:
          Number.parseInt(det.getAttribute("nItem") ?? String(index + 1), 10) || index + 1,
        code: textOf(firstByTag(prod, "cProd")),
        ean: cleanEan(textOf(firstByTag(prod, "cEAN")) ?? ""),
        description: textOf(firstByTag(prod, "xProd")),
        ncm: textOf(firstByTag(prod, "NCM")) || undefined,
        cfop: textOf(firstByTag(prod, "CFOP")) || undefined,
        unit: textOf(firstByTag(prod, "uCom")) || "UN",
        quantity: qCom,
        unitPrice: vUnCom,
        totalPrice: vProd || qCom * vUnCom,
      };
    })
    .filter((item): item is ParsedNFeItem => !!item && (!!item.description || !!item.code));

  if (items.length === 0) {
    throw new Error("Nenhum item de produto encontrado no XML.");
  }

  const accessKey = (infNFe.getAttribute("Id") ?? "").replace(/^NFe/, "") || undefined;

  return {
    accessKey,
    number: textOf(firstByTag(ide, "nNF")) || undefined,
    series: textOf(firstByTag(ide, "serie")) || undefined,
    issueDate:
      textOf(firstByTag(ide, "dhEmi")) ||
      textOf(firstByTag(ide, "dEmi")) ||
      undefined,
    emitterName: textOf(firstByTag(emit, "xNome")),
    emitterDocument:
      textOf(firstByTag(emit, "CNPJ")) || textOf(firstByTag(emit, "CPF")) || undefined,
    totalValue:
      parseNumber(textOf(firstByTag(icmsTot, "vNF"))) ||
      items.reduce((sum, item) => sum + item.totalPrice, 0),
    items,
    source: "xml",
    warnings: [],
  };
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const chunks: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join("\n");
    chunks.push(pageText);
  }

  return chunks.join("\n");
}

function extractAccessKey(text: string): string | undefined {
  const compact = text.match(/\b(\d{44})\b/);
  if (compact) return compact[1];

  const spaced = text.match(/(?:\d{4}\s+){10}\d{4}/);
  if (spaced) return spaced[0].replace(/\s+/g, "");

  return undefined;
}

function extractEmitterName(text: string): string {
  const magazine = text.match(
    /N[°º]\s*\d*\s*([A-Z0-9][A-Z0-9\s./\-&]{4,80}?(?:S\/A|LTDA|EIRELI|ME|EPP))\s+(?:ROD|RUA|AV\.|AV |R\.)/i,
  );
  if (magazine?.[1]) return magazine[1].replace(/\s+/g, " ").trim();

  const receipt = text.match(
    /RECEBEMOS DE\s+(.+?)\s+OS PRODUTOS/i,
  );
  if (receipt?.[1]) return receipt[1].replace(/\s+/g, " ").trim();

  const razao = text.match(/RAZ[AÃ]O SOCIAL[:\s]+(.+?)(?:CNPJ|CPF|INSCRI)/i);
  if (razao?.[1]) return razao[1].replace(/\s+/g, " ").trim();

  return "Emitente não identificado";
}

function extractInvoiceMeta(text: string): { number?: string; series?: string } {
  const serieBlock = text.match(/(\d{1,3})\s+S[EÉ]RIE\s*\n?\s*(\d{5,9})/i);
  if (serieBlock) {
    return { series: serieBlock[1], number: serieBlock[2] };
  }

  const nfBlock = text.match(/NF-e\s*\n?\s*(\d{1,3})\s*\n?\s*(\d{5,9})/i);
  if (nfBlock) {
    return { series: nfBlock[1], number: nfBlock[2] };
  }

  return {
    number: text.match(/N[°º]\.?\s*(\d{5,9})/i)?.[1],
  };
}

function parseDanfeProductRows(text: string): ParsedNFeItem[] {
  const items: ParsedNFeItem[] = [];
  const lines = text.replace(/\r/g, "").split("\n");

  const rowRegex =
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s+([\d.,]+)\s+(\d{8})\s+(\d{4})\s+([A-Z]{1,4})\s+([\d.,]+)\s+(\d{3,15})\s+\d+\s+[\d.,]+\s+(.+)$/i;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\t/g, " ").trim();
    const match = line.match(rowRegex);
    if (!match) continue;

    let description = match[8].replace(/\s+/g, " ").trim();
    const nextLine = lines[i + 1]?.replace(/\t/g, " ").trim() ?? "";

    if (
      nextLine &&
      /^[A-Z0-9][A-Za-z0-9 \-/]{2,80}$/i.test(nextLine) &&
      !/^VLR\b/i.test(nextLine) &&
      !/^DADOS\b/i.test(nextLine)
    ) {
      description = `${description} ${nextLine}`.trim();
      i += 1;
    }

    items.push({
      lineNumber: items.length + 1,
      code: match[7],
      description,
      ncm: match[3],
      cfop: match[4],
      unit: match[5],
      quantity: parseNumber(match[6]),
      unitPrice: parseNumber(match[2]),
      totalPrice: parseNumber(match[1]),
    });
  }

  if (items.length > 0) return items;

  const normalized = text.replace(/\t/g, " ").replace(/\r/g, "");
  const productSection = normalized.split(/DADOS DO PRODUTO/i)[1];
  if (productSection) {
    const ncmLine = productSection.match(
      /(\d{8})\s+(\d{4})\s+([A-Z]{1,4})\s+([\d.,]+)\s+(\d{3,15})\s+[\d.,]+\s+([\s\S]{5,120}?)(?=VLR BC|DADOS ADICIONAIS|$)/i,
    );
    if (ncmLine) {
      const totalMatch = productSection.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
      const unitMatch = productSection.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2,4})/g);
      items.push({
        lineNumber: 1,
        code: ncmLine[5],
        description: ncmLine[6].replace(/\s+/g, " ").trim(),
        ncm: ncmLine[1],
        cfop: ncmLine[2],
        unit: ncmLine[3],
        quantity: parseNumber(ncmLine[4]),
        unitPrice: unitMatch && unitMatch.length > 1 ? parseNumber(unitMatch[1]) : 0,
        totalPrice: totalMatch ? parseNumber(totalMatch[1]) : 0,
      });
    }
  }

  return items;
}

function parseDanfeText(text: string): ParsedNFe {
  const warnings: string[] = [
    "Leitura via DANFE (PDF). Para maior precisão, prefira o arquivo XML da NF-e.",
  ];

  const items = parseDanfeProductRows(text);
  if (items.length === 0) {
    throw new Error(
      "Não foi possível extrair itens do PDF. Envie o XML da NF-e ou um DANFE mais legível.",
    );
  }

  const totalFromNote = text.match(/VALOR TOTAL DA NOTA\s*\n?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i);
  const totalValue = totalFromNote
    ? parseNumber(totalFromNote[1])
    : items.reduce((sum, item) => sum + item.totalPrice, 0);

  warnings.push(`Foram identificados ${items.length} item(ns) no PDF.`);

  const invoiceMeta = extractInvoiceMeta(text);

  return {
    accessKey: extractAccessKey(text),
    number: invoiceMeta.number,
    series: invoiceMeta.series,
    issueDate: text.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1],
    emitterName: extractEmitterName(text),
    emitterDocument: text.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)?.[1],
    totalValue,
    items,
    source: "pdf",
    warnings,
  };
}

export async function parseNFeFile(file: File, source: NFeImportSource): Promise<ParsedNFe> {
  if (source === "xml") {
    const xmlText = await file.text();
    return parseNFeXml(xmlText);
  }

  const pdfText = await extractPdfText(file);
  if (!pdfText.trim()) {
    throw new Error("PDF sem texto legível (pode ser imagem escaneada). Use o XML da NF-e.");
  }
  return parseDanfeText(pdfText);
}

export function formatNFeDate(value?: string): string {
  if (!value) return "—";
  if (value.includes("/")) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

// Exportado para testes unitários locais
export const __testing = {
  parseNFeXml,
  parseDanfeText,
  parseNumber,
  sanitizeXmlInput,
};
