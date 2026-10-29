# BSE PDF Chrome Helper Extension

Maximizes the **entire Chrome window** and opens announcement PDFs from the BSE frontend.

## Why this exists

A normal website cannot maximize Chrome. This extension uses:

```js
chrome.windows.update(windowId, { state: 'maximized' })
chrome.tabs.create({ windowId, url: pdfUrl })
```

## Install (developer mode)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder:

```text
BSE/frontend/chrome-extension
```

5. Confirm **BSE PDF Chrome Helper** appears and is enabled
6. Open/refresh the BSE app: `http://localhost:5173`

## What it does

When the frontend auto-opens a matching PDF:

1. Maximizes the current Chrome window (small → full size)
2. Opens the PDF as a **new tab in that same window**
3. First PDF tab is focused; later ones can open without forcing focus (via page options)

## Permissions

| Permission | Why |
|------------|-----|
| `windows` | Maximize Chrome |
| `tabs` | Open PDF tabs |
| Host: `localhost:5173` | Talk to the BSE frontend |
| Host: `bseindia.com` | Allow opening BSE PDF URLs |

## Frontend integration

The React app sends:

```js
window.postMessage({
  source: 'bse-frontend',
  type: 'BSE_MAXIMIZE_AND_OPEN_PDF',
  pdfUrl: '...',
  maximize: true,
  active: true,
  requestId: '...',
}, '*')
```

If the extension is not installed, the app falls back to `window.open`.

## Uninstall / rollback

1. `chrome://extensions` → Remove **BSE PDF Chrome Helper**
2. Frontend continues to work with normal `window.open` fallback
