'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Property } from '@/types'
import { loadSalesData, calculateDashboardStats, getPriceDistribution, getLocationStats } from '@/lib/data'
import { formatPrice, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Home, TrendingUp, MapPin, Calendar, DollarSign, BarChart3, Filter, GitCompare, Brain, Target, Award, Building2, ArrowLeft } from 'lucide-react'
import AlgerianMap from '@/components/AlgerianMap'
import PropertyFilters from '@/components/PropertyFilters'
import PropertyComparison from '@/components/PropertyComparison'
import MarketingKPIs from '@/components/MarketingKPIs'
import BIAnalytics from '@/components/BIAnalytics'
import AlgeriaInsights from '@/components/AlgeriaInsights'
import PredictiveAnalytics from '@/components/PredictiveAnalytics'

// Mock data - replace with actual data loading
const mockSalesData: Property[] = [
  {
    Title: "Appartement F4 Alger",
    Price: 25000000,
    PricePerSqm: 200000,
    Location: "Hydra",
    Wilaya: "Alger",
    Description: "Bel appartement avec vue sur mer",
    Surface: 125,
    Rooms: 4,
    PropertyType: "Appartement",
    Category: "immobilier-vente-appartement",
    Source: "Ouedkniss",
    Date: "2024-01-15",
    Link: "https://example.com",
    ImageURLs: ""
  },
  // Add more mock data as needed
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function SalesDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [showMap, setShowMap] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await loadSalesData()
        console.log('Loaded sales data:', salesData.length, 'properties')
        setProperties(salesData)
        setFilteredProperties(salesData)
        
        // Calculate real stats from loaded data
        const realStats = calculateDashboardStats(salesData)
        setStats(realStats)
      } catch (error) {
        console.error('Error loading sales data:', error)
        // Fallback to mock data if loading fails
        setProperties(mockSalesData)
        setFilteredProperties(mockSalesData)
        setStats({
          totalProperties: 1321,
          averagePrice: 29347982,
          medianPrice: 16500000,
          priceRange: { min: 11778, max: 420000000 },
          topWilayas: [
            { name: "Béjaïa", count: 464 },
            { name: "Annaba", count: 396 },
            { name: "Alger", count: 250 },
            { name: "Oran", count: 60 },
            { name: "Boumerdès", count: 36 }
          ],
          propertyTypes: [
            { type: "Appartement", count: 850 },
            { type: "Villa", count: 280 },
            { type: "Maison", count: 120 },
            { type: "Terrain", count: 71 }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const priceDistribution = [
    { range: "< 10M DA", count: 245, percentage: 18.5 },
    { range: "10M - 20M DA", count: 398, percentage: 30.1 },
    { range: "20M - 50M DA", count: 456, percentage: 34.5 },
    { range: "50M - 100M DA", count: 156, percentage: 11.8 },
    { range: "> 100M DA", count: 66, percentage: 5.0 }
  ]

  const monthlyTrends = [
    { month: "Jan", count: 98, avgPrice: 28500000 },
    { month: "Fév", count: 112, avgPrice: 29200000 },
    { month: "Mar", count: 125, avgPrice: 30100000 },
    { month: "Avr", count: 108, avgPrice: 28900000 },
    { month: "Mai", count: 134, avgPrice: 31200000 },
    { month: "Jun", count: 142, avgPrice: 32100000 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des données de vente...</p>
        </div>

        {/* Property Comparison Modal */}
        {showComparison && (
          <PropertyComparison
            properties={filteredProperties}
            onClose={() => setShowComparison(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Home className="h-8 w-8 text-green-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Tableau de Bord - Ventes
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showMap ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>Carte</span>
              </button>
              
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <GitCompare className="h-5 w-5" />
                <span>Comparer</span>
              </button>
              
              <Link href="/rental" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Location
              </Link>
              <Link href="/chat" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Assistant IA
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analytics Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Vue d'ensemble</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('marketing')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'marketing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>KPIs Marketing</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('bi')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bi'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>BI Analytics</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('algeria')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'algeria'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Insights Algérie</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('predictive')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'predictive'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>IA Prédictive</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <>
              {/* Property Filters */}
              <PropertyFilters
                properties={properties}
                onFilteredProperties={setFilteredProperties}
                transactionType="sales"
              />

              {/* Map View */}
              {showMap && (
                <div className="mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Répartition Géographique des Ventes
                    </h2>
                    <AlgerianMap properties={filteredProperties} />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'marketing' && (
            <MarketingKPIs properties={filteredProperties} />
          )}

          {activeTab === 'bi' && (
            <BIAnalytics properties={filteredProperties} />
          )}

          {activeTab === 'algeria' && (
            <AlgeriaInsights properties={filteredProperties} />
          )}

          {activeTab === 'predictive' && (
            <PredictiveAnalytics properties={filteredProperties} />
          )}

          {/* Key Metrics - Show only in overview */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Propriétés</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalProperties || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prix Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.averagePrice || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prix Médian</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.medianPrice || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Fourchette Prix</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(stats?.priceRange.min || 0)} - {formatPrice(stats?.priceRange.max || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Price Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Prix</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value as number), 'Nombre']} />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Wilayas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Wilayas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.topWilayas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats?.topWilayas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances Mensuelles</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'count' ? formatNumber(value as number) : formatPrice(value as number),
                      name === 'count' ? 'Nombre d\'annonces' : 'Prix moyen'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#3B82F6" />
                  <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Property Types */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de Propriétés</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats?.propertyTypes.map((type, index) => (
                  <div key={type.type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(type.count)}</div>
                    <div className="text-sm text-gray-600">{type.type}</div>
                    <div className="text-xs text-gray-500">
                      {((type.count / (stats?.totalProperties || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Listings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Annonces Récentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Propriété
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surface
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.slice(0, 10).map((property, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.Title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(property.Price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.Location}, {property.Wilaya}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.Surface ? `${property.Surface} m²` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {property.PropertyType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* Property Comparison Modal */}
    {showComparison && (
      <PropertyComparison
        properties={filteredProperties}
        onClose={() => setShowComparison(false)}
      />
    )}
  </div>
  </main>
</div>
)
}