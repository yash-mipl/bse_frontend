/** BSE announcements feed configuration */

export const ANNOUNCEMENT_STORAGE_KEY = 'bse_corporate_announcements'

/** Maximum records retained in localStorage and shown in the UI */
export const MAX_ANNOUNCEMENTS = 20

/** Scrip code range shown in the listing (inclusive) */
export const SCRIP_CODE_MIN = 500_000
export const SCRIP_CODE_MAX = 600_000

/** Polling interval in milliseconds (0.5s) */
export const POLL_INTERVAL_MS = 500

/** Duration to highlight newly synced records (ms) */
export const NEW_RECORD_HIGHLIGHT_MS = 4000
