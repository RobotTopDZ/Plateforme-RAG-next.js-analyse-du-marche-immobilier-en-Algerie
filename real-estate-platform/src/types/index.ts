export interface Property {
  Title: string
  Price: number
  PricePerSqm?: number
  Location: string
  Wilaya: string
  Description: string
  Surface?: number
  Rooms?: number
  PropertyType: string
  Category: string
  Source: string
  Date: string
  Link: string
  ImageURLs?: string
}

export interface DashboardStats {
  totalProperties: number
  averagePrice: number
  medianPrice: number
  priceRange: {
    min: number
    max: number
  }
  topWilayas: Array<{
    name: string
    count: number
    percentage: number
  }>
  propertyTypes: Array<{
    type: string
    count: number
    percentage: number
  }>
}

export interface PriceDistribution {
  range: string
  count: number
  percentage: number
}

export interface LocationStats {
  wilaya: string
  location: string
  count: number
  averagePrice: number
  medianPrice: number
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface PropertyRecommendation {
  id: string
  title: string
  price: number
  location: string
  surface: number
  rooms: number
  type: string
  confidence: number
  reasons: string[]
  link: string
}