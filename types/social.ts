export interface SocialConfig {
  facebook: {
    appId: string
    appSecret: string
    pageId: string
  }
  instagram: {
    accessToken: string
    userId: string
  }
  google: {
    clientId: string
    clientSecret: string
  }
  line: {
    channelId: string
  }
}

export interface InstagramPost {
  id: string
  caption: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  permalink: string
  timestamp: string
  likeCount: number
  commentsCount: number
  thumbnail?: string
}

export interface FacebookPost {
  id: string
  message: string
  fullPicture?: string
  createdTime: string
  type: string
  likes: number
  comments: number
  shares: number
  link?: string
}

export interface SocialShare {
  id: string
  roomId: string
  platform: 'facebook' | 'instagram' | 'line' | 'twitter' | 'whatsapp' | 'email'
  timestamp: string
  userId?: string
  url: string
}

export interface SocialStats {
  totalShares: number
  sharesByPlatform: {
    platform: string
    count: number
  }[]
  topSharedRooms: {
    roomId: string
    roomName: string
    shares: number
  }[]
  recentShares: SocialShare[]
}

export interface SocialLoginProvider {
  provider: 'google' | 'facebook'
  providerId: string
  email: string
  name: string
  picture?: string
  accessToken: string
}
