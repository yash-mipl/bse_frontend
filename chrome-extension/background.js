/**
 * Same Chrome window as the listing: new PDF tab + maximize on redirect.
 * Load speed: open tab active first (full priority), warm HTTP cache, delay
 * switch-back for background opens so the PDF can start downloading.
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
    return true
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

/** How long a background PDF tab stays active so Chrome fetches at full speed. */
const BACKGROUND_LOAD_KICKSTART_MS = 600

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

/** Best-effort: pull PDF into Chrome's HTTP cache before/while the tab navigates. */
function warmPdfCache(pdfUrl) {
  return fetch(pdfUrl, {
    method: 'GET',
    cache: 'force-cache',
    credentials: 'omit',
  }).catch(() => null)
}

async function handleMaximizeAndOpenPdf(message, sender) {
  const pdfUrl = typeof message.pdfUrl === 'string' ? message.pdfUrl.trim() : ''
  if (!pdfUrl) {
    return { ok: false, error: 'Missing pdfUrl' }
  }

  const windowId = await resolveWindowId(sender)
  const maximize = message.maximize === true
  const active = message.active === true

  let previousTabId = sender.tab?.id ?? null
  if (!active) {
    const activeTabs = await chrome.tabs.query({ active: true, windowId })
    previousTabId = activeTabs[0]?.id ?? previousTabId
  }

  // Warm cache in parallel — do not wait before opening the tab.
  const cacheWarm = warmPdfCache(pdfUrl)

  // Same listing window: new tab, active so PDF load is high priority.
  const tab = await chrome.tabs.create({
    windowId,
    url: pdfUrl,
    active: true,
  })

  if (active || maximize) {
    // Maximize / focus without delaying the tab navigation that already started.
    void forceChromeOsFocus(windowId, active ? tab.id : null)
  }

  void cacheWarm

  // Background PDF 2/3: give the tab a short active window to start the download,
  // then return to the previous tab (usually PDF 1).
  if (!active && previousTabId != null && previousTabId !== tab.id) {
    await delay(BACKGROUND_LOAD_KICKSTART_MS)
    try {
      await chrome.tabs.update(previousTabId, { active: true })
    } catch {
      // Previous tab may have been closed
    }
  }

  return {
    ok: true,
    windowId,
    tabId: tab.id,
    maximized: maximize || active,
    active,
  }
}
