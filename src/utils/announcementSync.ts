import { MAX_ANNOUNCEMENTS, SCRIP_CODE_MAX, SCRIP_CODE_MIN } from '@/config/announcements'
import type { BseAnnouncement } from '@/types/bseAnnouncement'

const BSE_DT_TM_PATTERN =
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i

const BSE_TRADEDATE_PATTERN =
  /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/

/** Composite key for deduplication — never use array index. */
export function getAnnouncementKey(record: BseAnnouncement): string {
  return [
    record.SCRIP_CD?.trim() ?? '',
    record.Tradedate?.trim() ?? '',
    record.AttachmentName?.trim() ?? '',
    record.HeadLine?.trim() ?? '',
  ].join('|')
}

/** Only show announcements whose SCRIP_CD is between 500000 and 600000 (inclusive). */
export function isScripInDisplayRange(record: BseAnnouncement): boolean {
  const scripCode = Number.parseInt(record.SCRIP_CD?.trim() ?? '', 10)
  if (Number.isNaN(scripCode)) return false
  return scripCode >= SCRIP_CODE_MIN && scripCode <= SCRIP_CODE_MAX
}

export function filterAnnouncementsByScripRange(
  records: BseAnnouncement[],
): BseAnnouncement[] {
  return records.filter(isScripInDisplayRange)
}

function parse12HourTime(hour: number, ampm: string): number {
  const period = ampm.toUpperCase()
  if (period === 'PM' && hour !== 12) return hour + 12
  if (period === 'AM' && hour === 12) return 0
  return hour
}

/** Parse announcement timestamp for sorting — prefers Tradedate, falls back to DT_TM. */
export function parseAnnouncementTimestamp(record: BseAnnouncement): number {
  const tradedate = record.Tradedate?.trim()
  if (tradedate) {
    const match = tradedate.match(BSE_TRADEDATE_PATTERN)
    if (match) {
      const [, day, month, year, hour, minute, second] = match
      return new Date(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10) - 1,
        Number.parseInt(day, 10),
        Number.parseInt(hour, 10),
        Number.parseInt(minute, 10),
        Number.parseInt(second, 10),
      ).getTime()
    }
  }

  const dtTm = record.DT_TM?.trim()
  if (dtTm) {
    const match = dtTm.match(BSE_DT_TM_PATTERN)
    if (match) {
      const [, monthStr, dayStr, yearStr, hourStr, minuteStr, secondStr, ampmStr] = match
      const hour = parse12HourTime(Number.parseInt(hourStr, 10), ampmStr)
      return new Date(
        Number.parseInt(yearStr, 10),
        Number.parseInt(monthStr, 10) - 1,
        Number.parseInt(dayStr, 10),
        hour,
        Number.parseInt(minuteStr, 10),
        Number.parseInt(secondStr, 10),
      ).getTime()
    }
  }

  return 0
}

export function sortAnnouncementsDesc(records: BseAnnouncement[]): BseAnnouncement[] {
  return [...records].sort(
    (a, b) => parseAnnouncementTimestamp(b) - parseAnnouncementTimestamp(a),
  )
}

export type SyncAnnouncementsResult = {
  records: BseAnnouncement[]
  newKeys: string[]
  hasChanges: boolean
}

function recordsSnapshotEqual(a: BseAnnouncement[], b: BseAnnouncement[]): boolean {
  if (a.length !== b.length) return false

  for (let index = 0; index < a.length; index += 1) {
    if (getAnnouncementKey(a[index]) !== getAnnouncementKey(b[index])) return false
    if (JSON.stringify(a[index]) !== JSON.stringify(b[index])) return false
  }

  return true
}

/**
 * Merge existing local records with the latest API snapshot.
 * API missing records are NOT treated as deletions.
 */
export function syncAnnouncements(
  existingRecords: BseAnnouncement[],
  apiRecords: BseAnnouncement[],
  maxRecords: number = MAX_ANNOUNCEMENTS,
): SyncAnnouncementsResult {
  const filteredExisting = filterAnnouncementsByScripRange(existingRecords)
  const filteredApi = filterAnnouncementsByScripRange(apiRecords)

  const recordMap = new Map<string, BseAnnouncement>()
  const existingKeySet = new Set<string>()

  for (const record of filteredExisting) {
    const key = getAnnouncementKey(record)
    recordMap.set(key, record)
    existingKeySet.add(key)
  }

  const newKeys: string[] = []

  for (const record of filteredApi) {
    const key = getAnnouncementKey(record)
    if (!existingKeySet.has(key)) {
      newKeys.push(key)
    }
    recordMap.set(key, record)
  }

  const records = sortAnnouncementsDesc(Array.from(recordMap.values())).slice(0, maxRecords)

  return {
    records,
    newKeys,
    hasChanges: newKeys.length > 0 || !recordsSnapshotEqual(records, filteredExisting),
  }
}
