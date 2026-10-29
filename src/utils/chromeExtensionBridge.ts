/**
 * Bridge to the BSE Chrome extension (maximize window + open PDF tabs).
 */

const PAGE_SOURCE = 'bse-frontend'
const EXT_SOURCE = 'bse-extension'

export type ExtensionOpenPdfResult = {
  ok: boolean
  windowId?: number
  tabId?: number
  maximized?: boolean
  active?: boolean
  error?: string
}

function waitForExtensionResult<T>(
  resultType: string,
  requestId: string,
  timeoutMs = 1500,
): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve(null)
    }, timeoutMs)

    function onMessage(event: MessageEvent) {
      if (event.source !== window) return
      const data = event.data
      if (!data || data.source !== EXT_SOURCE) return
      if (data.type !== resultType || data.requestId !== requestId) return

      window.clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      resolve((data.response as T) ?? null)
    }

    window.addEventListener('message', onMessage)
  })
}

/** Ask the extension to maximize the current Chrome window. */
export async function requestChromeMaximize(): Promise<boolean> {
  const requestId = `max-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const resultPromise = waitForExtensionResult<{ ok?: boolean }>(
    'BSE_MAXIMIZE_WINDOW_RESULT',
    requestId,
  )

  window.postMessage(
    {
      source: PAGE_SOURCE,
      type: 'BSE_MAXIMIZE_WINDOW',
      requestId,
    },
    '*',
  )

  const result = await resultPromise
  return Boolean(result?.ok)
}

/**
 * Ask the extension to maximize Chrome (optional) and open the PDF in a tab.
 * Returns null if the extension is not installed / did not respond.
 */
export async function requestExtensionOpenPdf(
  pdfUrl: string,
  options: { maximize?: boolean; active?: boolean } = {},
): Promise<ExtensionOpenPdfResult | null> {
  const requestId = `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const resultPromise = waitForExtensionResult<ExtensionOpenPdfResult>(
    'BSE_MAXIMIZE_AND_OPEN_PDF_RESULT',
    requestId,
  )

  window.postMessage(
    {
      source: PAGE_SOURCE,
      type: 'BSE_MAXIMIZE_AND_OPEN_PDF',
      requestId,
      pdfUrl,
      // Explicit booleans — false must stay false (background tabs while viewing PDF 1).
      maximize: options.maximize === true,
      active: options.active === true,
    },
    '*',
  )

  return resultPromise
}
