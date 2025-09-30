'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts'
import { MapPin, Award, TrendingUp, Building, Users, Zap, Star, Flag } from 'lucide-react'

interface AlgeriaInsightsProps {
  properties: Property[]
  transactionType: 'sales' | 'rental'
}

// Algeria-specific data and insights
const WILAYA_ECONOMIC_DATA = {
  'Alger': { population: 3154792, gdpPerCapita: 8500, developmentIndex: 0.85, infrastructure: 9.2 },
  'Oran': { population: 1584607, gdpPerCapita: 7200, developmentIndex: 0.78, infrastructure: 8.5 },
  'Constantine': { population: 943112, gdpPerCapita: 6800, developmentIndex: 0.72, infrastructure: 7.8 },
  'Annaba': { population: 609499, gdpPerCapita: 6500, developmentIndex: 0.70, infrastructure: 7.5 },
  'Blida': { population: 1002937, gdpPerCapita: 6200, developmentIndex: 0.68, infrastructure: 7.2 },
  'Batna': { population: 1128030, gdpPerCapita: 5800, developmentIndex: 0.65, infrastructure: 6.8 },
  'Sétif': { population: 1496150, gdpPerCapita: 6000, developmentIndex: 0.67, infrastructure: 7.0 },
  'Sidi Bel Abbès': { population: 590258, gdpPerCapita: 5500, developmentIndex: 0.62, infrastructure: 6.5 },
  'Biskra': { population: 721356, gdpPerCapita: 5200, developmentIndex: 0.60, infrastructure: 6.2 },
  'Tébessa': { population: 648703, gdpPerCapita: 5000, developmentIndex: 0.58, infrastructure: 6.0 }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AlgeriaInsights({ properties, transactionType }: AlgeriaInsightsProps) {
  const [wilayaRankings, setWilayaRankings] = useState<any[]>([])
  const [economicCorrelation, setEconomicCorrelation] = useState<any[]>([])
  const [marketMaturity, setMarketMaturity] = useState<any[]>([])
  const [developmentPotential, setDevelopmentPotential] = useState<any[]>([])
  const [regionalTrends, setRegionalTrends] = useState<any[]>([])

  useEffect(() => {
    calculateAlgeriaInsights()
  }, [properties])

  const calculateAlgeriaInsights = () => {
    // Wilaya Rankings with comprehensive scoring
    const wilayaData = properties.reduce((acc: any, property) => {
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
          marketActivity: 0,
          priceStability: 0,
          investmentScore: 0
        }
      }
      
      acc[wilaya].totalListings += 1
      acc[wilaya].totalValue += property.Price
      acc[wilaya].totalSurface += property.Surface
      
      return acc
    }, {})

    const wilayaRankingsData = Object.values(wilayaData).map((wilaya: any) => {
      const economicData = WILAYA_ECONOMIC_DATA[wilaya.wilaya as keyof typeof WILAYA_ECONOMIC_DATA] || 
        { population: 500000, gdpPerCapita: 5000, developmentIndex: 0.5, infrastructure: 5.0 }
      
      const avgPrice = wilaya.totalValue / wilaya.totalListings
      const avgSurface = wilaya.totalSurface / wilaya.totalListings
      const pricePerSqm = wilaya.totalValue / wilaya.totalSurface
      
      // Calculate comprehensive scores
      const marketActivity = Math.min(100, (wilaya.totalListings / properties.length) * 1000)
      const priceStability = Math.max(0, 100 - (Math.random() * 30)) // Mock stability score
      const investmentScore = (
        (marketActivity * 0.3) +
        (priceStability * 0.2) +
        (economicData.developmentIndex * 100 * 0.3) +
        (economicData.infrastructure * 10 * 0.2)
      )
      
      return {
        ...wilaya,
        ...economicData,
        avgPrice: Math.round(avgPrice),
        avgSurface: Math.round(avgSurface),
        pricePerSqm: Math.round(pricePerSqm),
        marketActivity: parseFloat(marketActivity.toFixed(1)),
        priceStability: parseFloat(priceStability.toFixed(1)),
        investmentScore: parseFloat(investmentScore.toFixed(1)),
        affordabilityIndex: parseFloat((economicData.gdpPerCapita / (avgPrice / 1000000) * 100).toFixed(1))
      }
    }).sort((a: any, b: any) => b.investmentScore - a.investmentScore)

    setWilayaRankings(wilayaRankingsData)

    // Economic Correlation Analysis
    const correlationData = wilayaRankingsData.map(wilaya => ({
      wilaya: wilaya.wilaya,
      gdpPerCapita: wilaya.gdpPerCapita,
      avgPrice: wilaya.avgPrice / 1000000, // Convert to millions for better visualization
      developmentIndex: wilaya.developmentIndex * 100,
      infrastructure: wilaya.infrastructure * 10,
      marketActivity: wilaya.marketActivity
    }))

    setEconomicCorrelation(correlationData)

    // Market Maturity Analysis
    const maturityData = wilayaRankingsData.map(wilaya => ({
      wilaya: wilaya.wilaya,
      marketSize: wilaya.totalListings,
      priceStability: wilaya.priceStability,
      liquidityIndex: Math.min(100, wilaya.totalListings * 2), // Mock liquidity
      institutionalPresence: Math.random() * 100, // Mock institutional presence
      regulatoryCompliance: Math.random() * 100, // Mock compliance score
      maturityScore: (wilaya.priceStability + Math.min(100, wilaya.totalListings * 2) + Math.random() * 100) / 3
    })).sort((a: any, b: any) => b.maturityScore - a.maturityScore)

    setMarketMaturity(maturityData)

    // Development Potential Analysis
    const potentialData = wilayaRankingsData.map(wilaya => ({
      wilaya: wilaya.wilaya,
      currentScore: wilaya.investmentScore,
      growthPotential: Math.max(0, 100 - wilaya.investmentScore + Math.random() * 20),
      infrastructureDevelopment: wilaya.infrastructure * 10,
      economicDiversification: Math.random() * 100,
      demographicBonus: Math.min(100, (wilaya.population / 1000000) * 50),
      potentialScore: 0
    }))

    potentialData.forEach(item => {
      item.potentialScore = (
        item.growthPotential * 0.3 +
        item.infrastructureDevelopment * 0.25 +
        item.economicDiversification * 0.25 +
        item.demographicBonus * 0.2
      )
    })

    setDevelopmentPotential(potentialData.sort((a, b) => b.potentialScore - a.potentialScore))

    // Regional Trends (Mock time series data)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
    const trendsData = months.map((month, index) => {
      const baseGrowth = Math.random() * 10 - 5 // -5% to +5%
      return {
        month,
        alger: 5 + baseGrowth + Math.random() * 3,
        oran: 3 + baseGrowth + Math.random() * 3,
        constantine: 2 + baseGrowth + Math.random() * 3,
        national: 3.5 + baseGrowth + Math.random() * 2
      }
    })

    setRegionalTrends(trendsData)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="w-5 h-5 text-green-600" />
    if (score >= 60) return <Star className="w-5 h-5 text-yellow-600" />
    if (score >= 40) return <TrendingUp className="w-5 h-5 text-orange-600" />
    return <Flag className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Algeria Market Overview */}
      <div className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-lg border">
        <div className="flex items-center space-x-3 mb-4">
          <Flag className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Marché Immobilier Algérien - Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{wilayaRankings.length}</p>
            <p className="text-sm text-gray-600">Wilayas Analysées</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{formatNumber(properties.length)}</p>
            <p className="text-sm text-gray-600">Propriétés Totales</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {formatPrice(properties.reduce((sum, p) => sum + p.Price, 0) / properties.length)}
            </p>
            <p className="text-sm text-gray-600">Prix Moyen National</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {Math.round(properties.reduce((sum, p) => sum + p.Surface, 0) / properties.length)}m²
            </p>
            <p className="text-sm text-gray-600">Surface Moyenne</p>
          </div>
        </div>
      </div>

      {/* Wilaya Rankings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Classement des Wilayas - Score d'Investissement</h3>
        <div className="space-y-3">
          {wilayaRankings.slice(0, 10).map((wilaya, index) => (
            <div key={wilaya.wilaya} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{wilaya.wilaya}</h4>
                  <p className="text-sm text-gray-600">
                    {formatNumber(wilaya.population)} habitants | PIB/hab: {formatPrice(wilaya.gdpPerCapita)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(wilaya.avgPrice)}</p>
                  <p className="text-sm text-gray-600">{wilaya.totalListings} annonces</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(wilaya.investmentScore)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(wilaya.investmentScore)}`}>
                    {wilaya.investmentScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Correlation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Corrélation Économique - PIB vs Prix Immobilier</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={economicCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wilaya" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'avgPrice' ? `${value}M DA` : 
                  name === 'gdpPerCapita' ? `${formatPrice(value)}` : 
                  `${value}`,
                  name === 'avgPrice' ? 'Prix Moyen' :
                  name === 'gdpPerCapita' ? 'PIB/Habitant' :
                  name === 'developmentIndex' ? 'Indice Développement' :
                  'Activité Marché'
                ]}
              />
              <Bar yAxisId="left" dataKey="avgPrice" fill="#8884d8" name="avgPrice" />
              <Bar yAxisId="right" dataKey="gdpPerCapita" fill="#82ca9d" name="gdpPerCapita" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Maturity & Development Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maturité du Marché par Wilaya</h3>
          <div className="space-y-3">
            {marketMaturity.slice(0, 8).map((market, index) => (
              <div key={market.wilaya} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{market.wilaya}</h4>
                  <p className="text-sm text-gray-600">
                    Taille: {market.marketSize} | Stabilité: {market.priceStability.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(market.maturityScore)}`}>
                    {market.maturityScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Potentiel de Développement</h3>
          <div className="space-y-3">
            {developmentPotential.slice(0, 8).map((potential, index) => (
              <div key={potential.wilaya} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{potential.wilaya}</h4>
                  <p className="text-sm text-gray-600">
                    Croissance: {potential.growthPotential.toFixed(1)}% | Infra: {potential.infrastructureDevelopment.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(potential.potentialScore)}`}>
                    {potential.potentialScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances Régionales - Croissance des Prix (%)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={regionalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Croissance']} />
              <Line type="monotone" dataKey="alger" stroke="#8884d8" strokeWidth={3} name="Alger" />
              <Line type="monotone" dataKey="oran" stroke="#82ca9d" strokeWidth={2} name="Oran" />
              <Line type="monotone" dataKey="constantine" stroke="#ffc658" strokeWidth={2} name="Constantine" />
              <Line type="monotone" dataKey="national" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" name="National" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Clés - Marché Algérien</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Leader du Marché</span>
            </div>
            <p className="text-sm text-blue-800">
              {wilayaRankings[0]?.wilaya} domine avec un score d'investissement de {wilayaRankings[0]?.investmentScore.toFixed(1)}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Meilleur Potentiel</span>
            </div>
            <p className="text-sm text-green-800">
              {developmentPotential[0]?.wilaya} présente le plus fort potentiel de développement
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Marché Mature</span>
            </div>
            <p className="text-sm text-purple-800">
              {marketMaturity[0]?.wilaya} affiche la plus grande maturité de marché
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}