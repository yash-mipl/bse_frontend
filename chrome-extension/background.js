/**
 * Opens PDFs as new tabs in the SAME Chrome window as the listing.
 * Responds immediately after tabs.create so the page bridge does not time out.
 *
 * - active: new tab focused + maximize window + OS focus (Ctrl+F)
 * - !active: new tab in background (stay on current PDF)
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
    return true // keep channel open for async sendResponse
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

  try {
    const current = await chrome.windows.getCurrent()
    if (current?.id != null) return current.id
  } catch {
    // service worker may not have a "current" window
  }

  const windows = await chrome.windows.getAll({ populate: false, windowTypes: ['normal'] })
  const focused = windows.find((w) => w.focused)
  return focused?.id ?? windows[0]?.id
}

async function handleMaximize(sender) {
  const windowId = await resolveWindowId(sender)
  if (windowId != null) {
    await chrome.windows.update(windowId, { state: 'maximized', focused: true })
  }
  return { ok: true, windowId, maximized: true }
}

async function forceChromeOsFocus(windowId, tabId) {
  if (windowId == null) return

  await chrome.windows.update(windowId, {
    focused: true,
    state: 'maximized',
  })

  if (tabId != null) {
    try {
      await chrome.tabs.update(tabId, { active: true })
    } catch {
      // ignore
    }
  }

  await chrome.windows.update(windowId, { focused: true })
}

async function handleMaximizeAndOpenPdf(message, sender) {
  const pdfUrl = typeof message.pdfUrl === 'string' ? message.pdfUrl.trim() : ''
  if (!pdfUrl) {
    return { ok: false, error: 'Missing pdfUrl' }
  }

  const windowId = await resolveWindowId(sender)
  if (windowId == null) {
    return { ok: false, error: 'Could not resolve Chrome window for listing tab' }
  }

  const maximize = message.maximize === true
  const active = message.active === true

  // Same window as listing — new tab (not a new window).
  const tab = await chrome.tabs.create({
    windowId,
    url: pdfUrl,
    active,
  })

  // Redirect path: maximize + bring Chrome to foreground for keyboard focus.
  if (active || maximize) {
    await forceChromeOsFocus(windowId, active ? tab.id : null)
  }

  return {
    ok: true,
    windowId,
    tabId: tab.id,
    maximized: maximize || active,
    active,
  }
}
