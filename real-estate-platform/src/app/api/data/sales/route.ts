import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), '..', 'cleaned_data', 'immobilier_sales.csv')
    const csvData = readFileSync(filePath, 'utf-8')
    
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error reading sales data:', error)
    return NextResponse.json({ error: 'Failed to load sales data' }, { status: 500 })
  }
}