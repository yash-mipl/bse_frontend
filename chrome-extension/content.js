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
        const err = chrome.runtime.lastError
        window.postMessage(
          {
            source: EXT_SOURCE,
            type: 'BSE_MAXIMIZE_WINDOW_RESULT',
            requestId: data.requestId,
            response: err
              ? { ok: false, error: err.message }
              : (response ?? { ok: false, error: 'No response from extension' }),
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
        maximize: data.maximize === true,
        active: data.active === true,
      },
      (response) => {
        const err = chrome.runtime.lastError
        window.postMessage(
          {
            source: EXT_SOURCE,
            type: 'BSE_MAXIMIZE_AND_OPEN_PDF_RESULT',
            requestId: data.requestId,
            response: err
              ? { ok: false, error: err.message }
              : (response ?? { ok: false, error: 'No response from extension' }),
          },
          '*',
        )
      },
    )
  }
})

window.postMessage({ source: EXT_SOURCE, type: 'BSE_EXTENSION_READY' }, '*')
