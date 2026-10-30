/**
 * Background service worker — opens PDFs via chrome.windows.create.
 *
 * Behavior (unchanged product rules):
 * - On listing (active): new maximized focused window → redirect + OS focus (Ctrl+F works)
 * - While viewing a PDF (!active): new window, not focused → PDF 2/3 without interrupting
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
  await forceChromeOsFocus(windowId)
  return { ok: true, windowId, maximized: true }
}

/**
 * Steal OS keyboard focus onto Chrome so shortcuts like Ctrl+F hit the PDF,
 * even if another app was focused when the redirect happened.
 * Windows sometimes ignores a single focus request — do a short double-pass.
 */
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
      // Tab may not be ready yet
    }
  }

  await chrome.windows.update(windowId, { focused: true })
}

async function handleMaximizeAndOpenPdf(message, _sender) {
  const pdfUrl = typeof message.pdfUrl === 'string' ? message.pdfUrl.trim() : ''
  if (!pdfUrl) {
    return { ok: false, error: 'Missing pdfUrl' }
  }

  const maximize = message.maximize === true
  const active = message.active === true

  // New window + URL in one step — Chrome starts the PDF at full priority.
  const win = await chrome.windows.create({
    url: pdfUrl,
    type: 'normal',
    focused: active,
    state: maximize || active ? 'maximized' : 'normal',
  })

  const windowId = win?.id
  const tabId = win?.tabs?.[0]?.id

  if (active && windowId != null) {
    // Redirect path: force Chrome to the foreground (fixes Ctrl+F when another app had focus).
    await forceChromeOsFocus(windowId, tabId)
  } else if (maximize && windowId != null) {
    await chrome.windows.update(windowId, { state: 'maximized' })
  }

  return {
    ok: true,
    windowId,
    tabId,
    maximized: maximize || active,
    active,
  }
}
