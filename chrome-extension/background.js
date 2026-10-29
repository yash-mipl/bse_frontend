/**
 * Background service worker — maximizes Chrome and opens PDF tabs.
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

async function handleMaximizeAndOpenPdf(message, sender) {
  const pdfUrl = typeof message.pdfUrl === 'string' ? message.pdfUrl.trim() : ''
  if (!pdfUrl) {
    return { ok: false, error: 'Missing pdfUrl' }
  }

  const windowId = await resolveWindowId(sender)
  const maximize = message.maximize === true
  const active = message.active === true

  // Only steal focus on the first (maximized) PDF. Later PDFs open as background tabs
  // so the user can keep reading PDF 1 while 2/3 appear.
  if (maximize) {
    await chrome.windows.update(windowId, { state: 'maximized', focused: true })
  }

  const tab = await chrome.tabs.create({
    windowId,
    url: pdfUrl,
    active,
  })

  return {
    ok: true,
    windowId,
    tabId: tab.id,
    maximized: maximize,
    active,
  }
}
