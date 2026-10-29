import type { BseAnnouncement } from "@/types/bseAnnouncement";
import { getAnnouncementKey } from "@/utils/announcementSync";
import { requestExtensionOpenPdf } from "@/utils/chromeExtensionBridge";
import { isAutoOpenDescriptor } from "@/utils/descriptorMatch";

export const OPENED_PDF_STORAGE_KEY = "bse_auto_opened_pdfs";

export type OpenedPdfRecord = {
  documentId: string;
  pdfUrl: string;
  companyName: string;
  descriptor: string;
  dateLabel: string;
  openedAt: string;
};

/** Stable document id — prefer AttachmentName, then URL, then composite key. */
export function getPdfDocumentId(record: BseAnnouncement): string {
  const attachmentName = record.AttachmentName?.trim();
  if (attachmentName) return `attachment:${attachmentName}`;

  const url = normalizePdfUrl(record.ATTACHMENTURL);
  if (url) return `url:${url}`;

  return `key:${getAnnouncementKey(record)}`;
}

export function normalizePdfUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function isValidPdfUrl(url: string | null | undefined): boolean {
  return normalizePdfUrl(url) !== null;
}

export function loadOpenedPdfIds(): Set<string> {
  try {
    const raw = localStorage.getItem(OPENED_PDF_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(OPENED_PDF_STORAGE_KEY);
      return new Set();
    }
    return new Set(
      parsed.filter((item): item is string => typeof item === "string"),
    );
  } catch {
    localStorage.removeItem(OPENED_PDF_STORAGE_KEY);
    return new Set();
  }
}

export function saveOpenedPdfIds(ids: Set<string>): void {
  localStorage.setItem(OPENED_PDF_STORAGE_KEY, JSON.stringify([...ids]));
}

export function markPdfOpened(
  documentId: string,
  openedIds: Set<string>,
): Set<string> {
  const next = new Set(openedIds);
  next.add(documentId);
  saveOpenedPdfIds(next);
  return next;
}

export type AutoOpenCandidate = {
  record: BseAnnouncement;
  documentId: string;
  pdfUrl: string;
};

export function collectAutoOpenCandidates(
  records: BseAnnouncement[],
  newKeys: string[],
  alreadyOpened: Set<string>,
  pending: Set<string>,
): AutoOpenCandidate[] {
  if (newKeys.length === 0) return [];

  const newKeySet = new Set(newKeys);
  const candidates: AutoOpenCandidate[] = [];

  for (const record of records) {
    const key = getAnnouncementKey(record);
    if (!newKeySet.has(key)) continue;
    if (!isAutoOpenDescriptor(record.Descriptor)) continue;

    const pdfUrl = normalizePdfUrl(record.ATTACHMENTURL);
    if (!pdfUrl) {
      console.warn(
        "[auto-pdf] Matching descriptor but missing/invalid PDF URL",
        {
          company: record.CompanyName,
          descriptor: record.Descriptor,
        },
      );
      continue;
    }

    const documentId = getPdfDocumentId(record);
    if (alreadyOpened.has(documentId) || pending.has(documentId)) continue;

    candidates.push({ record, documentId, pdfUrl });
  }

  return candidates;
}

export type OpenPdfOptions = {
  /** Maximize the whole Chrome window (via extension when available). */
  maximize?: boolean;
  /** Whether the new PDF tab should become active (default true). */
  active?: boolean;
};

export type OpenPdfResult = {
  opened: boolean;
  viaExtension: boolean;
  windowHandle: Window | null;
};

/**
 * Warm DNS/TLS/HTTP cache so the PDF tab can paint faster once opened.
 * Uses no-cors — we only care that the browser starts downloading bytes.
 */
export function prefetchPdf(pdfUrl: string): void {
  const normalized = normalizePdfUrl(pdfUrl);
  if (!normalized) return;

  try {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "fetch";
    link.href = normalized;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  } catch {
    // ignore
  }

  void fetch(normalized, {
    method: "GET",
    mode: "no-cors",
    credentials: "omit",
    cache: "force-cache",
  } as RequestInit).catch(() => {
    // Cross-origin PDFs may opaque-fail; tab navigation still works.
  });
}

/**
 * Open a PDF:
 * 1) Prefer Chrome extension → open tab first (fast load), then maximize
 * 2) Fallback → window.open (cannot maximize existing Chrome)
 */
export async function openPdfInNewTab(
  pdfUrl: string,
  options: OpenPdfOptions = {},
): Promise<OpenPdfResult> {
  const maximize = options.maximize === true;
  const active = options.active !== false;

  prefetchPdf(pdfUrl);

  try {
    const extensionResult = await requestExtensionOpenPdf(pdfUrl, {
      maximize,
      active,
    });
    if (extensionResult?.ok) {
      console.info("[auto-pdf] Opened via Chrome extension", {
        maximized: extensionResult.maximized,
        tabId: extensionResult.tabId,
        active: extensionResult.active,
      });
      return { opened: true, viaExtension: true, windowHandle: null };
    }

    // Fallback without extension
    if (maximize) {
      const width = window.screen.availWidth;
      const height = window.screen.availHeight;
      const features = [
        `left=0`,
        `top=0`,
        `width=${width}`,
        `height=${height}`,
        "menubar=yes",
        "toolbar=yes",
        "location=yes",
        "status=yes",
        "resizable=yes",
        "scrollbars=yes",
      ].join(",");

      const popup = window.open(pdfUrl, "_blank", features);
      if (!popup)
        return { opened: false, viaExtension: false, windowHandle: null };

      try {
        popup.moveTo(0, 0);
        popup.resizeTo(width, height);
        popup.focus();
      } catch {
        // Cross-origin may block move/resize after navigation
      }

      console.warn(
        "[auto-pdf] Extension not available — opened fallback popup (install chrome-extension to maximize whole Chrome)",
      );
      return { opened: true, viaExtension: false, windowHandle: popup };
    }

    const tab = window.open(pdfUrl, "_blank", "noopener,noreferrer");
    return { opened: Boolean(tab), viaExtension: false, windowHandle: tab };
  } catch (error) {
    console.error("[auto-pdf] Failed to open PDF", error);
    return { opened: false, viaExtension: false, windowHandle: null };
  }
}
