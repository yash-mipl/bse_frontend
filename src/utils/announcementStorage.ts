import { ANNOUNCEMENT_STORAGE_KEY } from '@/config/announcements'
import type { BseAnnouncement } from '@/types/bseAnnouncement'

export function loadAnnouncementsFromStorage(): BseAnnouncement[] {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY)
      return []
    }

    return parsed as BseAnnouncement[]
  } catch {
    localStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY)
    return []
  }
}

export function saveAnnouncementsToStorage(records: BseAnnouncement[]): void {
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(records))
}
