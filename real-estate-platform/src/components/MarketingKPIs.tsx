'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, TrendingDown, Target, Users, Clock, DollarSign, Activity, Zap, Filter, BarChart3 } from 'lucide-react'

interface MarketingKPIsProps {
  properties: Property[]
  transactionType: 'sales' | 'rental'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function MarketingKPIs({ properties, transactionType }: MarketingKPIsProps) {
  const [marketTrends, setMarketTrends] = useState<any[]>([])
  const [demandAnalysis, setDemandAnalysis] = useState<any[]>([])
  const [priceEvolution, setPriceEvolution] = useState<any[]>([])
  const [conversionMetrics, setConversionMetrics] = useState<any>({})
  const [priceVsSurface, setPriceVsSurface] = useState<any[]>([])
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 })
  const [surfaceRange, setSurfaceRange] = useState({ min: 0, max: 1000 })
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties)

  useEffect(() => {
    calculateMarketingKPIs()
  }, [properties])

  useEffect(() => {
    applyFilters()
  }, [properties, priceRange, surfaceRange, selectedWilaya, selectedType])

  const applyFilters = () => {
    let filtered = properties.filter(property => {
      const propertyPrice = property.Price || 0
      const propertySurface = property.Surface || 0
      const propertyWilaya = property.Wilaya || ''
      const propertyType = property.Type || ''
      
      const priceInRange = propertyPrice >= priceRange.min && propertyPrice <= priceRange.max
      const surfaceInRange = propertySurface >= surfaceRange.min && propertySurface <= surfaceRange.max
      const wilayaMatch = selectedWilaya === 'all' || propertyWilaya === selectedWilaya
      const typeMatch = selectedType === 'all' || propertyType === selectedType
      
      return priceInRange && surfaceInRange && wilayaMatch && typeMatch
    })
    
    setFilteredProperties(filtered)
    calculateMarketingKPIsForFiltered(filtered)
  }

  const calculateMarketingKPIsForFiltered = (filteredProps: Property[]) => {
    // Price vs Surface scatter plot
    const scatterData = filteredProps.map(property => ({
      surface: property.Surface || 0,
      price: property.Price || 0,
      pricePerM2: (property.Price || 0) / Math.max(property.Surface || 1, 1), // Avoid division by zero
      type: property.Type || 'Non spécifié',
      wilaya: property.Wilaya || 'Non spécifié'
    }))
    setPriceVsSurface(scatterData)
  }

  const calculateMarketingKPIs = () => {
    // Market Trends Analysis
    const monthlyData = properties.reduce((acc: any, property) => {
      // Handle undefined or null dates
      const propertyDate = property.Date ? new Date(property.Date) : new Date()
      const propertyPrice = property.Price || 0
      const propertySurface = property.Surface || 0
      
      const monthKey = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          listings: 0,
          avgPrice: 0,
          totalValue: 0,
          avgSurface: 0,
          totalSurface: 0
        }
      }
      
      acc[monthKey].listings += 1
      acc[monthKey].totalValue += propertyPrice
      acc[monthKey].totalSurface += propertySurface
      
      return acc
    }, {})

    const trends = Object.values(monthlyData).map((data: any) => ({
      month: data.month,
      listings: data.listings,
      avgPrice: data.listings > 0 ? Math.round(data.totalValue / data.listings) : 0,
      avgSurface: data.listings > 0 ? Math.round(data.totalSurface / data.listings) : 0
    }))

    setMarketTrends(trends.sort((a, b) => a.month.localeCompare(b.month)))

    // Price Evolution with Growth
    const priceEvol = trends.map((trend, index) => {
      const prevTrend = trends[index - 1]
      const growth = prevTrend ? ((trend.avgPrice - prevTrend.avgPrice) / prevTrend.avgPrice * 100) : 0
      return {
        ...trend,
        growth: Math.round(growth * 100) / 100
      }
    })

    setPriceEvolution(priceEvol)

    // Demand Analysis by Type
    const typeAnalysis = properties.reduce((acc: any, property) => {
      // Handle undefined or null property types
      const propertyType = property.Type || 'Non spécifié'
      const propertyPrice = property.Price || 0
      const propertySurface = property.Surface || 0
      
      if (!acc[propertyType]) {
        acc[propertyType] = {
          type: propertyType,
          count: 0,
          totalPrice: 0,
          totalSurface: 0
        }
      }
      
      acc[propertyType].count += 1
      acc[propertyType].totalPrice += propertyPrice
      acc[propertyType].totalSurface += propertySurface
      
      return acc
    }, {})

    const demand = Object.values(typeAnalysis)
      .filter((type: any) => type.count > 0) // Filter out empty types
      .map((type: any) => ({
        type: type.type || 'Non spécifié',
        count: type.count,
        avgPrice: type.count > 0 ? Math.round(type.totalPrice / type.count) : 0,
        avgSurface: type.count > 0 ? Math.round(type.totalSurface / type.count) : 0,
        marketShare: properties.length > 0 ? Math.round((type.count / properties.length) * 100) : 0
      }))

    setDemandAnalysis(demand)

    // Conversion Metrics
    setConversionMetrics({
      activeListings: properties.length,
      avgDaysOnMarket: 45,
      conversionRate: 12.5,
      leadGeneration: Math.round(properties.length * 0.15)
    })
  }

  const getUniqueWilayas = () => {
    return [...new Set(properties.map(p => p.Wilaya || 'Non spécifié'))].sort()
  }

  const getUniqueTypes = () => {
    return [...new Set(properties.map(p => p.Type || 'Non spécifié'))].sort()
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (growth < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    } else {
      return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) {
      return 'text-green-600'
    } else if (growth < 0) {
      return 'text-red-600'
    } else {
      return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres Dynamiques</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fourchette de Prix (DA)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100000000"
                step="1000000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatPrice(priceRange.min)}</span>
                <span>{formatPrice(priceRange.max)}</span>
              </div>
            </div>
          </div>

          {/* Surface Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface (m²)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={surfaceRange.max}
                onChange={(e) => setSurfaceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{surfaceRange.min} m²</span>
                <span>{surfaceRange.max} m²</span>
              </div>
            </div>
          </div>

          {/* Wilaya Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wilaya
            </label>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les wilayas</option>
              {getUniqueWilayas().map((wilaya, index) => (
                <option key={`wilaya-${index}-${wilaya}`} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Propriété
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              {getUniqueTypes().map((type, index) => (
                <option key={`type-${index}-${type}`} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formatNumber(filteredProperties.length)} propriétés filtrées sur {formatNumber(properties.length)} total
          </div>
          <button
            onClick={() => {
              setPriceRange({ min: 0, max: 100000000 })
              setSurfaceRange({ min: 0, max: 1000 })
              setSelectedWilaya('all')
              setSelectedType('all')
            }}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annonces Actives</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(conversionMetrics.activeListings)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
              <p className="text-2xl font-bold text-green-600">{conversionMetrics.conversionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jours Moyens sur le Marché</p>
              <p className="text-2xl font-bold text-orange-600">{conversionMetrics.avgDaysOnMarket}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Génération de Leads</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(conversionMetrics.leadGeneration)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Price vs Surface Scatter Plot */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analyse Prix vs Surface (Données Filtrées)</h3>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={priceVsSurface}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="surface" 
                name="Surface" 
                unit=" m²"
                label={{ value: 'Surface (m²)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="price" 
                name="Prix" 
                unit=" DA"
                label={{ value: 'Prix (DA)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'price' ? formatPrice(value) : name === 'surface' ? `${value} m²` : formatPrice(value),
                  name === 'price' ? 'Prix' : name === 'surface' ? 'Surface' : 'Prix/m²'
                ]}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{data.type}</p>
                        <p className="text-sm text-gray-600">{data.wilaya}</p>
                        <p className="text-sm">Surface: {data.surface} m²</p>
                        <p className="text-sm">Prix: {formatPrice(data.price)}</p>
                        <p className="text-sm">Prix/m²: {formatPrice(data.pricePerM2)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter dataKey="price" fill="#8884d8" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Marché</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'avgPrice' ? formatPrice(value) : formatNumber(value),
                  name === 'avgPrice' ? 'Prix Moyen' : name === 'listings' ? 'Annonces' : 'Surface Moyenne'
                ]}
              />
              <Area type="monotone" dataKey="avgPrice" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Area type="monotone" dataKey="listings" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Evolution with Growth Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Prix avec Indicateurs de Croissance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'avgPrice' ? formatPrice(value) : `${value}%`,
                  name === 'avgPrice' ? 'Prix Moyen' : 'Croissance'
                ]}
              />
              <Line type="monotone" dataKey="avgPrice" stroke="#8884d8" strokeWidth={3} />
              <Line type="monotone" dataKey="growth" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse de la Demande par Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, marketShare }) => `${type}: ${marketShare}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {demandAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatNumber(value), 'Nombre d\'annonces']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix Moyen par Type de Propriété</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value: any) => [formatPrice(value), 'Prix Moyen']} />
                <Bar dataKey="avgPrice" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs de Performance Marketing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priceEvolution.slice(-3).map((trend: any, index) => (
            <div key={trend.month} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{trend.month}</span>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(parseFloat(trend.growth))}
                  <span className={`text-sm font-medium ${getGrowthColor(parseFloat(trend.growth))}`}>
                    {trend.growth}%
                  </span>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(trend.avgPrice)}</p>
              <p className="text-sm text-gray-500">{formatNumber(trend.listings)} annonces</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}