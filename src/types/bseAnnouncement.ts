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

export type BseAnnouncementRequest = {
  Username: string
  Password: string
  Hr: string
  Min: string
  Sec: string
  Tradedt: string
}

export class BseApiError extends Error {
  readonly isCorsError: boolean
  readonly status?: number

  constructor(message: string, options?: { isCorsError?: boolean; status?: number }) {
    super(message)
    this.name = 'BseApiError'
    this.isCorsError = options?.isCorsError ?? false
    this.status = options?.status
  }
}
