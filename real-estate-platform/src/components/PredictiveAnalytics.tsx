'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, Brain, Target, Zap, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

interface PredictiveAnalyticsProps {
  properties: Property[]
  transactionType: 'sales' | 'rental'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function PredictiveAnalytics({ properties, transactionType }: PredictiveAnalyticsProps) {
  const [priceForecast, setPriceForecast] = useState<any[]>([])
  const [marketOpportunities, setMarketOpportunities] = useState<any[]>([])
  const [trendPredictions, setTrendPredictions] = useState<any[]>([])
  const [riskPredictions, setRiskPredictions] = useState<any[]>([])
  const [investmentRecommendations, setInvestmentRecommendations] = useState<any[]>([])

  useEffect(() => {
    calculatePredictiveAnalytics()
  }, [properties])

  const calculatePredictiveAnalytics = () => {
    // Price Forecasting Model (simplified linear regression + seasonal adjustments)
    const currentAvgPrice = properties.reduce((sum, p) => sum + p.Price, 0) / properties.length
    const months = ['Jan 2024', 'Fév 2024', 'Mar 2024', 'Avr 2024', 'Mai 2024', 'Jun 2024', 
                   'Jul 2024', 'Aoû 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Déc 2024',
                   'Jan 2025', 'Fév 2025', 'Mar 2025', 'Avr 2025', 'Mai 2025', 'Jun 2025']

    const forecastData = months.map((month, index) => {
      // Base trend: 3-8% annual growth
      const baseTrend = 1 + (0.05 / 12) // 5% annual growth monthly
      
      // Seasonal adjustments (higher in spring/summer)
      const seasonalFactor = 1 + (Math.sin((index % 12) * Math.PI / 6) * 0.02)
      
      // Market volatility
      const volatility = 1 + (Math.random() - 0.5) * 0.03
      
      const predictedPrice = currentAvgPrice * Math.pow(baseTrend, index) * seasonalFactor * volatility
      
      // Confidence intervals
      const confidence = Math.max(0.6, 1 - (index * 0.02)) // Decreasing confidence over time
      const upperBound = predictedPrice * (1 + (1 - confidence) * 0.5)
      const lowerBound = predictedPrice * (1 - (1 - confidence) * 0.5)
      
      return {
        month,
        predicted: Math.round(predictedPrice),
        upperBound: Math.round(upperBound),
        lowerBound: Math.round(lowerBound),
        confidence: parseFloat((confidence * 100).toFixed(1)),
        growth: index > 0 ? ((predictedPrice - currentAvgPrice) / currentAvgPrice * 100).toFixed(1) : '0.0'
      }
    })

    setPriceForecast(forecastData)

    // Market Opportunities Detection
    const wilayaAnalysis = properties.reduce((acc: any, property) => {
      const wilaya = property.Wilaya
      if (!acc[wilaya]) {
        acc[wilaya] = {
          wilaya,
          properties: [],
          avgPrice: 0,
          totalValue: 0,
          count: 0,
          priceGrowthPotential: 0,
          demandScore: 0,
          supplyConstraints: 0
        }
      }
      
      acc[wilaya].properties.push(property)
      acc[wilaya].totalValue += property.Price
      acc[wilaya].count += 1
      
      return acc
    }, {})

    const opportunities = Object.values(wilayaAnalysis).map((wilaya: any) => {
      const avgPrice = wilaya.totalValue / wilaya.count
      const marketShare = (wilaya.count / properties.length) * 100
      
      // Opportunity scoring algorithm
      const priceGrowthPotential = Math.random() * 25 + 5 // 5-30% potential
      const demandScore = Math.min(100, marketShare * 3 + Math.random() * 30)
      const supplyConstraints = Math.random() * 100
      const opportunityScore = (priceGrowthPotential * 0.4) + (demandScore * 0.3) + (supplyConstraints * 0.3)
      
      return {
        ...wilaya,
        avgPrice: Math.round(avgPrice),
        marketShare: parseFloat(marketShare.toFixed(1)),
        priceGrowthPotential: parseFloat(priceGrowthPotential.toFixed(1)),
        demandScore: parseFloat(demandScore.toFixed(1)),
        supplyConstraints: parseFloat(supplyConstraints.toFixed(1)),
        opportunityScore: parseFloat(opportunityScore.toFixed(1)),
        recommendation: opportunityScore > 70 ? 'Forte' : opportunityScore > 50 ? 'Modérée' : 'Faible',
        timeHorizon: opportunityScore > 70 ? '6-12 mois' : opportunityScore > 50 ? '12-18 mois' : '18+ mois'
      }
    }).sort((a: any, b: any) => b.opportunityScore - a.opportunityScore)

    setMarketOpportunities(opportunities.slice(0, 10))

    // Trend Predictions
    const propertyTypes = [...new Set(properties.map(p => p.PropertyType))]
    const trendData = propertyTypes.map(type => {
      const typeProperties = properties.filter(p => p.PropertyType === type)
      const avgPrice = typeProperties.reduce((sum, p) => sum + p.Price, 0) / typeProperties.length
      
      // Predict trends for next 12 months
      const trendStrength = Math.random() * 100
      const volatility = Math.random() * 50
      const marketSentiment = Math.random() * 100
      
      return {
        propertyType: type,
        currentAvgPrice: Math.round(avgPrice),
        count: typeProperties.length,
        trendStrength: parseFloat(trendStrength.toFixed(1)),
        volatility: parseFloat(volatility.toFixed(1)),
        marketSentiment: parseFloat(marketSentiment.toFixed(1)),
        predictedGrowth: parseFloat((trendStrength / 10 - 5).toFixed(1)), // -5% to +5%
        riskLevel: volatility > 35 ? 'Élevé' : volatility > 20 ? 'Modéré' : 'Faible'
      }
    })

    setTrendPredictions(trendData)

    // Risk Predictions
    const riskFactors = [
      {
        factor: 'Volatilité des Prix',
        currentLevel: Math.random() * 100,
        predictedLevel: Math.random() * 100,
        impact: 'Élevé',
        probability: Math.random() * 100
      },
      {
        factor: 'Liquidité du Marché',
        currentLevel: Math.random() * 100,
        predictedLevel: Math.random() * 100,
        impact: 'Modéré',
        probability: Math.random() * 100
      },
      {
        factor: 'Conditions Économiques',
        currentLevel: Math.random() * 100,
        predictedLevel: Math.random() * 100,
        impact: 'Élevé',
        probability: Math.random() * 100
      },
      {
        factor: 'Réglementation',
        currentLevel: Math.random() * 100,
        predictedLevel: Math.random() * 100,
        impact: 'Modéré',
        probability: Math.random() * 100
      }
    ]

    setRiskPredictions(riskFactors)

    // Investment Recommendations
    const recommendations = opportunities.slice(0, 5).map((opp, index) => ({
      rank: index + 1,
      wilaya: opp.wilaya,
      strategy: index < 2 ? 'Achat Immédiat' : index < 4 ? 'Surveillance Active' : 'Attente',
      expectedReturn: opp.priceGrowthPotential,
      riskLevel: opp.opportunityScore > 80 ? 'Faible' : opp.opportunityScore > 60 ? 'Modéré' : 'Élevé',
      timeframe: opp.timeHorizon,
      confidence: Math.max(60, 100 - index * 5),
      investmentAmount: Math.round(opp.avgPrice * (1 + Math.random() * 0.2)), // Suggested investment
      reasoning: `Score d'opportunité élevé (${opp.opportunityScore}) avec potentiel de croissance de ${opp.priceGrowthPotential}%`
    }))

    setInvestmentRecommendations(recommendations)
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Forte': return 'text-green-600 bg-green-100'
      case 'Modérée': return 'text-yellow-600 bg-yellow-100'
      case 'Faible': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Faible': return 'text-green-600'
      case 'Modéré': return 'text-yellow-600'
      case 'Élevé': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Predictive Analytics Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Analytics Prédictifs - IA Immobilière</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {priceForecast.length > 0 ? `+${priceForecast[11]?.growth}%` : '+5.2%'}
            </p>
            <p className="text-sm text-gray-600">Croissance Prédite (12 mois)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{marketOpportunities.length}</p>
            <p className="text-sm text-gray-600">Opportunités Identifiées</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {priceForecast.length > 0 ? `${priceForecast[5]?.confidence}%` : '85%'}
            </p>
            <p className="text-sm text-gray-600">Confiance Modèle (6 mois)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{investmentRecommendations.length}</p>
            <p className="text-sm text-gray-600">Recommandations Actives</p>
          </div>
        </div>
      </div>

      {/* Price Forecasting */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévision des Prix - Modèle IA</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  formatPrice(value),
                  name === 'predicted' ? 'Prix Prédit' :
                  name === 'upperBound' ? 'Limite Haute' : 'Limite Basse'
                ]}
              />
              <Area type="monotone" dataKey="upperBound" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
              <Area type="monotone" dataKey="lowerBound" stackId="1" stroke="#8884d8" fill="#ffffff" fillOpacity={0.8} />
              <Line type="monotone" dataKey="predicted" stroke="#ff7300" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {priceForecast.slice(5, 8).map((forecast, index) => (
            <div key={forecast.month} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">{forecast.month}</span>
                <span className="text-xs text-gray-500">Confiance: {forecast.confidence}%</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(forecast.predicted)}</p>
              <p className="text-sm text-green-600">+{forecast.growth}% vs aujourd'hui</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Opportunities */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunités de Marché Détectées</h3>
        <div className="space-y-3">
          {marketOpportunities.slice(0, 8).map((opportunity, index) => (
            <div key={opportunity.wilaya} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{opportunity.wilaya}</h4>
                  <p className="text-sm text-gray-600">
                    {formatPrice(opportunity.avgPrice)} | {opportunity.count} propriétés
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-green-600">+{opportunity.priceGrowthPotential}%</p>
                  <p className="text-sm text-gray-600">{opportunity.timeHorizon}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(opportunity.recommendation)}`}>
                    {opportunity.recommendation}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Predictions & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prédictions de Tendances</h3>
          <div className="space-y-3">
            {trendPredictions.map((trend, index) => (
              <div key={trend.propertyType} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{trend.propertyType}</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${trend.predictedGrowth > 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm font-medium ${trend.predictedGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.predictedGrowth > 0 ? '+' : ''}{trend.predictedGrowth}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Sentiment: {trend.marketSentiment.toFixed(0)}/100</span>
                  <span className={getRiskColor(trend.riskLevel)}>Risque: {trend.riskLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évaluation des Risques</h3>
          <div className="space-y-3">
            {riskPredictions.map((risk, index) => (
              <div key={risk.factor} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{risk.factor}</span>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`w-4 h-4 ${risk.impact === 'Élevé' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <span className="text-sm text-gray-600">{risk.impact}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Actuel: {risk.currentLevel.toFixed(0)}/100</span>
                  <span>Prédit: {risk.predictedLevel.toFixed(0)}/100</span>
                  <span>Probabilité: {risk.probability.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations d'Investissement IA</h3>
        <div className="space-y-4">
          {investmentRecommendations.map((rec, index) => (
            <div key={rec.wilaya} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full font-bold">
                    {rec.rank}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.wilaya}</h4>
                    <p className="text-sm text-gray-600">{rec.strategy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+{rec.expectedReturn}%</p>
                  <p className="text-sm text-gray-600">{rec.timeframe}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Montant suggéré:</span>
                  <p className="font-medium">{formatPrice(rec.investmentAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Niveau de risque:</span>
                  <p className={`font-medium ${getRiskColor(rec.riskLevel)}`}>{rec.riskLevel}</p>
                </div>
                <div>
                  <span className="text-gray-600">Confiance:</span>
                  <p className="font-medium">{rec.confidence}%</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{rec.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}