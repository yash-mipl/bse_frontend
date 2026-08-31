export type BseAnnouncement = {
  SCRIP_CD: string
  CompanyName: string
  DT_TM: string
  Filestatus: string
  HeadLine: string
  NewsSub: string
  AttachmentName: string
  NewsBody: string
  Descriptor: string
  CriticalNews: string
  TypeofAnnounce: string
  TypeofMeeting: string
  DateofMeeting: string
  DescriptorID: string
  ATTACHMENTURL: string
  Tradedate: string
}

/** Optional BSE request time filters sent from the frontend. */
export type BseTimeFilters = {
  Hr: string
  Min: string
  Sec: string
  Tradedt: string
}

export class BseApiError extends Error {
  readonly status?: number

  constructor(message: string, options?: { status?: number }) {
    super(message)
    this.name = 'BseApiError'
    this.status = options?.status
  }
}
