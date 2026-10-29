# Automatic Matching PDF Open

## Architecture analysis

| Item | Finding |
|------|---------|
| App type | **Normal website** — Vite + React 19 (not a Chrome extension) |
| Entry | `frontend/src/main.tsx` → `AnnouncementsPage` |
| Listing feed | `useBseAnnouncements` polls `POST /api/bse/corporate-announcements` every 1s |
| New records | `syncAnnouncements()` returns `newKeys` |
| Descriptor | `record.Descriptor` |
| PDF URL | `record.ATTACHMENTURL` |
| Document id | Prefer `AttachmentName`, else URL, else composite announcement key |
| Existing PDF open | Manual `<a target="_blank">` in table |

### Browser capabilities of this website

| Capability | Supported here? |
|------------|-----------------|
| Open PDF URL | Yes — `window.open` / user click |
| Control tab index (open to the right) | **No** — requires `chrome.tabs` |
| Open tab without focusing (`active: false`) | **No** |
| Maximize Chrome window | **No** |
| Reliable auto-open without user gesture | **Often blocked** by popup blockers |

A Chrome extension would be required for exact tab ordering + background tabs + window maximize.

---

## What was implemented (smallest safe web approach)

1. **Descriptor matching** (`utils/descriptorMatch.ts`) — exact normalized match for:
   - Outcome Of The Board Meeting
   - Outcome Of Board Meeting
   - Financial Results
   - Newspaper Publication
   - Press Release
   - Press Release / Media Release
   - Media Release
   - Board Meeting
   - General
2. **New-record detection** — reuses existing poll + `newKeys` (no second poller).
3. **Baseline on first sync** — historical matching rows are marked processed; **not** opened.
4. **Auto open** — `window.open(pdfUrl, '_blank')` for newly synced matches.
5. **In-app toast** — shows descriptor, company, date; **View PDF** focuses existing window or opens on user click (works if popup was blocked).
6. **Duplicate prevention** — `localStorage` key `bse_auto_opened_pdfs` + in-memory pending set.

---

## Files changed

| File | Why |
|------|-----|
| `src/utils/descriptorMatch.ts` | Centralized descriptor matching |
| `src/utils/autoOpenPdf.ts` | IDs, URL validation, storage, candidates, open helper |
| `src/hooks/useAutoOpenMatchingPdfs.ts` | Baseline + open + notifications |
| `src/hooks/useBseAnnouncements.ts` | Hook into sync `newKeys` |
| `src/components/announcements/PdfOpenToastStack.tsx` | Toast UI |
| `src/pages/AnnouncementsPage.tsx` | Render toast stack |
| `src/utils/descriptorMatch.test.ts` | Unit tests |
| `docs/AUTO_OPEN_PDF.md` | This document |

---

## Limitations (honest)

- Subsequent PDFs may **steal focus** — websites cannot set `active: false`.
- Tab insertion “immediately to the right” is **not controllable**.
- Window maximize is **not available**.
- If Chrome blocks popups, toast shows **View PDF** (user click opens successfully).

To get full Phase 5 Chrome tab control, add a Chrome extension with `tabs` / `windows` permissions.

---

## Tests

```bash
cd frontend
node --experimental-strip-types --test src/utils/descriptorMatch.test.ts
```

---

## Rollback

1. Remove toast from `AnnouncementsPage`.
2. Remove auto-open call from `applySyncResult` in `useBseAnnouncements`.
3. Delete the new util/hook/toast files.
4. Clear `localStorage.bse_auto_opened_pdfs` if needed.
