/**
 * Content script — bridges the BSE React page and the extension background worker.
 * Page posts: window.postMessage({ source: 'bse-frontend', type: '...', ... }, '*')
 */

const PAGE_SOURCE = 'bse-frontend'
const EXT_SOURCE = 'bse-extension'

window.addEventListener('message', (event) => {
  if (event.source !== window) return
  const data = event.data
  if (!data || data.source !== PAGE_SOURCE) return

  if (data.type === 'BSE_MAXIMIZE_WINDOW') {
    chrome.runtime.sendMessage(
      { source: EXT_SOURCE, type: 'MAXIMIZE_WINDOW' },
      (response) => {
        window.postMessage(
          {
            source: EXT_SOURCE,
            type: 'BSE_MAXIMIZE_WINDOW_RESULT',
            requestId: data.requestId,
            response: response ?? { ok: false, error: chrome.runtime.lastError?.message },
          },
          '*',
        )
      },
    )
    return
  }

  if (data.type === 'BSE_MAXIMIZE_AND_OPEN_PDF') {
    chrome.runtime.sendMessage(
      {
        source: EXT_SOURCE,
        type: 'MAXIMIZE_AND_OPEN_PDF',
        pdfUrl: data.pdfUrl,
        // Preserve explicit false so later PDFs open without stealing focus.
        maximize: data.maximize === true,
        active: data.active === true,
      },
      (response) => {
        window.postMessage(
          {
            source: EXT_SOURCE,
            type: 'BSE_MAXIMIZE_AND_OPEN_PDF_RESULT',
            requestId: data.requestId,
            response: response ?? { ok: false, error: chrome.runtime.lastError?.message },
          },
          '*',
        )
      },
    )
  }
})

// Let the page know the extension content script is present
window.postMessage({ source: EXT_SOURCE, type: 'BSE_EXTENSION_READY' }, '*')
