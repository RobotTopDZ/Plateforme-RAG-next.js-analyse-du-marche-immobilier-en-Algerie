import { Property, DashboardStats, PriceDistribution, LocationStats } from '@/types'
import Papa from 'papaparse'

// Load CSV data functions
export async function loadSalesData(): Promise<Property[]> {
  try {
    const response = await fetch('/api/data/sales')
    if (!response.ok) {
      throw new Error('Failed to load sales data')
    }
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const properties = results.data.map((row: any) => ({
            Title: row.Title || '',
            TransactionType: row.TransactionType || 'SALE',
            Price: parseFloat(row.Price) || 0,
            PricePerSqm: parseFloat(row.PricePerSqm) || null,
            Location: row.Location || '',
            Wilaya: row.Wilaya || '',
            Description: row.Description || '',
            Surface: parseFloat(row.Surface) || null,
            Rooms: parseInt(row.Rooms) || null,
            PropertyType: row.PropertyType || 'Autre',
            Category: row.Category || '',
            Source: row.Source || '',
            Date: row.Date || '',
            Link: row.Link || '',
            ImageURLs: row.ImageURLs || ''
          })) as Property[]
          
          resolve(properties.filter(p => p.Price > 0))
        },
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('Error loading sales data:', error)
    return []
  }
}

export async function loadRentalData(): Promise<Property[]> {
  try {
    const response = await fetch('/api/data/rental')
    if (!response.ok) {
      throw new Error('Failed to load rental data')
    }
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const properties = results.data.map((row: any) => ({
            Title: row.Title || '',
            TransactionType: row.TransactionType || 'RENTAL',
            Price: parseFloat(row.Price) || 0,
            PricePerSqm: parseFloat(row.PricePerSqm) || null,
            Location: row.Location || '',
            Wilaya: row.Wilaya || '',
            Description: row.Description || '',
            Surface: parseFloat(row.Surface) || null,
            Rooms: parseInt(row.Rooms) || null,
            PropertyType: row.PropertyType || 'Autre',
            Category: row.Category || '',
            Source: row.Source || '',
            Date: row.Date || '',
            Link: row.Link || '',
            ImageURLs: row.ImageURLs || ''
          })) as Property[]
          
          resolve(properties.filter(p => p.Price > 0))
        },
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('Error loading rental data:', error)
    return []
  }
}

export function calculateDashboardStats(properties: Property[]): DashboardStats {
  if (properties.length === 0) {
    return {
      totalProperties: 0,
      averagePrice: 0,
      medianPrice: 0,
      priceRange: { min: 0, max: 0 },
      topWilayas: [],
      propertyTypes: []
    }
  }

  const prices = properties.map(p => p.Price).sort((a, b) => a - b)
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const medianPrice = prices[Math.floor(prices.length / 2)]

  // Count by Wilaya
  const wilayaCounts = properties.reduce((acc, property) => {
    acc[property.Wilaya] = (acc[property.Wilaya] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topWilayas = Object.entries(wilayaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ 
      name, 
      count, 
      percentage: Math.round((count / properties.length) * 100 * 10) / 10 
    }))

  // Count by Property Type
  const typeCounts = properties.reduce((acc, property) => {
    acc[property.PropertyType] = (acc[property.PropertyType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const propertyTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ 
      type, 
      count, 
      percentage: Math.round((count / properties.length) * 100 * 10) / 10 
    }))

  return {
    totalProperties: properties.length,
    averagePrice,
    medianPrice,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    topWilayas,
    propertyTypes
  }
}

export function calculatePriceDistribution(properties: Property[]): PriceDistribution[] {
  if (properties.length === 0) return []

  const ranges = [
    { min: 0, max: 5_000_000, label: '< 5M DA' },
    { min: 5_000_000, max: 10_000_000, label: '5M - 10M DA' },
    { min: 10_000_000, max: 20_000_000, label: '10M - 20M DA' },
    { min: 20_000_000, max: 50_000_000, label: '20M - 50M DA' },
    { min: 50_000_000, max: 100_000_000, label: '50M - 100M DA' },
    { min: 100_000_000, max: Infinity, label: '> 100M DA' }
  ]

  const distribution = ranges.map(range => {
    const count = properties.filter(p => p.Price >= range.min && p.Price < range.max).length
    const percentage = (count / properties.length) * 100
    return {
      range: range.label,
      count,
      percentage: Math.round(percentage * 10) / 10
    }
  })

  return distribution.filter(d => d.count > 0)
}

export function calculateLocationStats(properties: Property[]): LocationStats[] {
  const locationGroups = properties.reduce((acc, property) => {
    const key = `${property.Wilaya}-${property.Location}`
    if (!acc[key]) {
      acc[key] = {
        wilaya: property.Wilaya,
        location: property.Location,
        properties: []
      }
    }
    acc[key].properties.push(property)
    return acc
  }, {} as Record<string, { wilaya: string, location: string, properties: Property[] }>)

  return Object.values(locationGroups)
    .map(group => {
      const prices = group.properties.map(p => p.Price).sort((a, b) => a - b)
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const medianPrice = prices[Math.floor(prices.length / 2)]

      return {
        wilaya: group.wilaya,
        location: group.location,
        count: group.properties.length,
        averagePrice,
        medianPrice
      }
    })
    .sort((a, b) => b.count - a.count)
}