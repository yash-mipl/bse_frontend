/**
 * Background service worker — opens PDFs via chrome.windows.create.
 *
 * Why this is faster than tabs.create in the listing window:
 * - A new focused + maximized window gets full network/render priority
 * - Same-window / inactive tabs are throttled by Chrome (PDF content feels slow)
 *
 * Behavior (unchanged product rules):
 * - On listing (active): new maximized focused window → redirect feel
 * - While viewing a PDF (!active): new window, not focused → PDF 2/3 load without interrupting
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.source !== 'bse-extension') {
    return false
  }

  if (message.type === 'MAXIMIZE_AND_OPEN_PDF') {
    handleMaximizeAndOpenPdf(message, sender)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    return true // async response
  }

  if (message.type === 'MAXIMIZE_WINDOW') {
    handleMaximize(sender)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    return true
  }

  return false
})

async function resolveWindowId(sender) {
  if (sender.tab?.windowId != null) {
    return sender.tab.windowId
  }

  const current = await chrome.windows.getCurrent()
  return current.id
}

async function handleMaximize(sender) {
  const windowId = await resolveWindowId(sender)
  await chrome.windows.update(windowId, { state: 'maximized', focused: true })
  return { ok: true, windowId, maximized: true }
}

async function handleMaximizeAndOpenPdf(message, _sender) {
  const pdfUrl = typeof message.pdfUrl === 'string' ? message.pdfUrl.trim() : ''
  if (!pdfUrl) {
    return { ok: false, error: 'Missing pdfUrl' }
  }

  const maximize = message.maximize === true
  const active = message.active === true

  // New window + URL in one step — Chrome starts the PDF at full priority
  // (same idea as: chrome.windows.create({ url, focused: true, state: 'maximized' }))
  const win = await chrome.windows.create({
    url: pdfUrl,
    type: 'normal',
    focused: active,
    state: maximize || active ? 'maximized' : 'normal',
  })

  const windowId = win?.id
  if (windowId != null && (maximize || active)) {
    await chrome.windows.update(windowId, {
      focused: active,
      state: 'maximized',
    })
  }

  const tabId = win?.tabs?.[0]?.id

  return {
    ok: true,
    windowId,
    tabId,
    maximized: maximize || active,
    active,
  }
}
