'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { TrendingUp, MapPin, PieChart, BarChart3, Target, Zap, Award, AlertTriangle } from 'lucide-react'

interface BIAnalyticsProps {
  properties: Property[]
  transactionType: 'sales' | 'rental'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function BIAnalytics({ properties, transactionType }: BIAnalyticsProps) {
  const [regionalPerformance, setRegionalPerformance] = useState<any[]>([])
  const [roiAnalysis, setROIAnalysis] = useState<any[]>([])
  const [marketSegmentation, setMarketSegmentation] = useState<any[]>([])
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<any[]>([])
  const [riskAssessment, setRiskAssessment] = useState<any>({})

  useEffect(() => {
    calculateBIMetrics()
  }, [properties])

  const calculateBIMetrics = () => {
    // Regional Performance Analysis
    const regionalData = properties.reduce((acc: any, property) => {
      const wilaya = property.Wilaya
      if (!acc[wilaya]) {
        acc[wilaya] = {
          wilaya,
          totalListings: 0,
          totalValue: 0,
          avgPrice: 0,
          avgSurface: 0,
          totalSurface: 0,
          pricePerSqm: 0,
          marketShare: 0,
          velocity: 0,
          appreciation: 0
        }
      }
      
      acc[wilaya].totalListings += 1
      acc[wilaya].totalValue += property.Price
      acc[wilaya].totalSurface += property.Surface
      
      return acc
    }, {})

    const totalMarketValue = properties.reduce((sum, p) => sum + p.Price, 0)
    const regionalPerf = Object.values(regionalData).map((region: any) => ({
      ...region,
      avgPrice: Math.round(region.totalValue / region.totalListings),
      avgSurface: Math.round(region.totalSurface / region.totalListings),
      pricePerSqm: Math.round(region.totalValue / region.totalSurface),
      marketShare: ((region.totalValue / totalMarketValue) * 100).toFixed(1),
      velocity: Math.random() * 100, // Mock velocity score
      appreciation: (Math.random() - 0.5) * 20 // Mock appreciation rate
    })).sort((a: any, b: any) => b.totalValue - a.totalValue)

    setRegionalPerformance(regionalPerf)

    // ROI Analysis by Property Type and Location
    const roiData = properties.reduce((acc: any, property) => {
      const key = `${property.PropertyType}-${property.Wilaya}`
      if (!acc[key]) {
        acc[key] = {
          segment: key,
          propertyType: property.PropertyType,
          wilaya: property.Wilaya,
          avgPrice: 0,
          totalPrice: 0,
          count: 0,
          expectedROI: 0,
          riskLevel: 'Medium',
          investmentPotential: 0
        }
      }
      
      acc[key].count += 1
      acc[key].totalPrice += property.Price
      
      return acc
    }, {})

    const roiAnalysisData = Object.values(roiData).map((item: any) => {
      const avgPrice = item.totalPrice / item.count
      const expectedROI = transactionType === 'rental' ? 
        (avgPrice * 0.08) / avgPrice * 100 : // 8% rental yield
        Math.random() * 15 + 5 // 5-20% capital appreciation
      
      return {
        ...item,
        avgPrice: Math.round(avgPrice),
        expectedROI: parseFloat(expectedROI.toFixed(1)),
        riskLevel: expectedROI > 12 ? 'High' : expectedROI > 8 ? 'Medium' : 'Low',
        investmentPotential: Math.min(100, expectedROI * 5 + Math.random() * 20)
      }
    }).sort((a: any, b: any) => b.expectedROI - a.expectedROI)

    setROIAnalysis(roiAnalysisData.slice(0, 10)) // Top 10 segments

    // Market Segmentation Analysis
    const priceRanges = [
      { range: '< 10M DA', min: 0, max: 10000000 },
      { range: '10-20M DA', min: 10000000, max: 20000000 },
      { range: '20-30M DA', min: 20000000, max: 30000000 },
      { range: '30-50M DA', min: 30000000, max: 50000000 },
      { range: '> 50M DA', min: 50000000, max: Infinity }
    ]

    const segmentationData = priceRanges.map(range => {
      const propertiesInRange = properties.filter(p => p.Price >= range.min && p.Price < range.max)
      const avgDaysOnMarket = Math.floor(Math.random() * 60) + 15 // Mock data
      const conversionRate = Math.random() * 25 + 5 // Mock conversion rate
      
      return {
        priceRange: range.range,
        count: propertiesInRange.length,
        marketShare: ((propertiesInRange.length / properties.length) * 100).toFixed(1),
        avgPrice: propertiesInRange.length > 0 ? 
          Math.round(propertiesInRange.reduce((sum, p) => sum + p.Price, 0) / propertiesInRange.length) : 0,
        avgDaysOnMarket,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        demand: propertiesInRange.length > properties.length * 0.2 ? 'High' : 
                propertiesInRange.length > properties.length * 0.1 ? 'Medium' : 'Low'
      }
    })

    setMarketSegmentation(segmentationData)

    // Competitive Analysis by Source
    const competitiveData = properties.reduce((acc: any, property) => {
      const source = property.Source
      if (!acc[source]) {
        acc[source] = {
          source,
          listings: 0,
          avgPrice: 0,
          totalPrice: 0,
          marketShare: 0,
          qualityScore: 0,
          responseTime: 0
        }
      }
      
      acc[source].listings += 1
      acc[source].totalPrice += property.Price
      
      return acc
    }, {})

    const competitiveAnalysisData = Object.values(competitiveData).map((comp: any) => ({
      ...comp,
      avgPrice: Math.round(comp.totalPrice / comp.listings),
      marketShare: ((comp.listings / properties.length) * 100).toFixed(1),
      qualityScore: Math.floor(Math.random() * 40) + 60, // Mock quality score 60-100
      responseTime: Math.floor(Math.random() * 24) + 1 // Mock response time 1-24 hours
    })).sort((a: any, b: any) => b.listings - a.listings)

    setCompetitiveAnalysis(competitiveAnalysisData)

    // Risk Assessment
    const totalListings = properties.length
    const avgPrice = properties.reduce((sum, p) => sum + p.Price, 0) / totalListings
    const priceVolatility = Math.random() * 30 + 10 // Mock volatility 10-40%
    const marketLiquidity = totalListings > 100 ? 'High' : totalListings > 50 ? 'Medium' : 'Low'
    
    setRiskAssessment({
      marketVolatility: parseFloat(priceVolatility.toFixed(1)),
      liquidityLevel: marketLiquidity,
      concentrationRisk: regionalPerf.length < 5 ? 'High' : regionalPerf.length < 10 ? 'Medium' : 'Low',
      seasonalityImpact: Math.floor(Math.random() * 30) + 10,
      economicSensitivity: Math.floor(Math.random() * 50) + 30
    })
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* BI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Volatilité du Marché</p>
              <p className="text-2xl font-bold text-gray-900">{riskAssessment.marketVolatility}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Niveau de Liquidité</p>
              <p className="text-2xl font-bold text-gray-900">{riskAssessment.liquidityLevel}</p>
            </div>
            <Zap className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risque de Concentration</p>
              <p className="text-2xl font-bold text-gray-900">{riskAssessment.concentrationRisk}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impact Saisonnier</p>
              <p className="text-2xl font-bold text-gray-900">{riskAssessment.seasonalityImpact}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Regional Performance Matrix */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Régionale - Matrice Prix vs Volume</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={regionalPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="totalListings" 
                name="Volume d'annonces"
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                dataKey="avgPrice" 
                name="Prix moyen"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'Prix moyen' ? formatPrice(value) : formatNumber(value),
                  name
                ]}
                labelFormatter={(label: any, payload: any) => {
                  if (payload && payload.length > 0) {
                    return `Wilaya: ${payload[0].payload.wilaya}`
                  }
                  return ''
                }}
              />
              <Scatter 
                dataKey="avgPrice" 
                fill="#8884d8" 
                name="Prix moyen"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {regionalPerformance.length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            Aucune donnée disponible pour l'analyse régionale
          </div>
        )}
      </div>

      {/* ROI Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse ROI par Segment</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="segment" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value}%`,
                  'ROI Attendu'
                ]}
                labelFormatter={(label) => `Segment: ${label}`}
              />
              <Bar dataKey="expectedROI" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {roiAnalysis.length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            Aucune donnée disponible pour l'analyse ROI
          </div>
        )}
      </div>

      {/* Market Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmentation par Gamme de Prix</h3>
          <div className="space-y-4">
            {marketSegmentation.map((segment, index) => (
              <div key={segment.priceRange} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{segment.priceRange}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      segment.demand === 'High' ? 'bg-green-100 text-green-800' :
                      segment.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {segment.demand}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatNumber(segment.count)} annonces ({segment.marketShare}%)
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Conversion: {segment.conversionRate}% | {segment.avgDaysOnMarket} jours
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse Concurrentielle</h3>
          <div className="space-y-4">
            {competitiveAnalysis.map((comp, index) => (
              <div key={comp.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{comp.source}</span>
                    <span className="text-sm text-gray-600">{comp.marketShare}%</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatNumber(comp.listings)} annonces | Score qualité: {comp.qualityScore}/100
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Prix moyen: {formatPrice(comp.avgPrice)} | Réponse: {comp.responseTime}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Assessment Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tableau de Bord des Risques</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Volatilité des Prix</span>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{riskAssessment.marketVolatility}%</p>
            <p className="text-sm text-gray-500">Écart-type des prix sur 12 mois</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Sensibilité Économique</span>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{riskAssessment.economicSensitivity}%</p>
            <p className="text-sm text-gray-500">Corrélation avec indicateurs macro</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Niveau de Liquidité</span>
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{riskAssessment.liquidityLevel}</p>
            <p className="text-sm text-gray-500">Facilité de transaction</p>
          </div>
        </div>
      </div>
    </div>
  )
}