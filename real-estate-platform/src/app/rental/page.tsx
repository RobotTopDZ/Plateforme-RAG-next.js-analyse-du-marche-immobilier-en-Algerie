'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, TrendingUp, MapPin, Building2, Calendar, Filter, GitCompare, Calculator } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts'
import { Property, DashboardStats } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { loadRentalData, calculateDashboardStats } from '@/lib/data'
import AlgerianMap from '@/components/AlgerianMap'
import PropertyFilters from '@/components/PropertyFilters'
import PropertyComparison from '@/components/PropertyComparison'

// Mock data - replace with actual data loading
const mockRentalData: Property[] = [
  {
    Title: "Appartement F3 Location Alger",
    Price: 45000,
    PricePerSqm: 450,
    Location: "Bab Ezzouar",
    Wilaya: "Alger",
    Description: "Appartement meublé proche université",
    Surface: 100,
    Rooms: 3,
    PropertyType: "Appartement",
    Category: "immobilier-location-appartement",
    Source: "Ouedkniss",
    Date: "2024-01-15",
    Link: "https://example.com",
    ImageURLs: ""
  },
  // Add more mock data as needed
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function RentalDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rentalData = await loadRentalData();
        setProperties(rentalData);
        
        // Calculate real stats from the loaded data using the shared function
        const realStats = calculateDashboardStats(rentalData);
        setStats(realStats);
      } catch (error) {
        console.error('Error loading rental data:', error);
        // Fallback to mock data if real data fails
        setProperties(mockRentalData);
        setStats({
          totalProperties: 257,
          averagePrice: 41829,
          medianPrice: 35000,
          priceRange: { min: 8000, max: 200000 },
          topWilayas: [
            { name: "Alger", count: 89 },
            { name: "Oran", count: 45 },
            { name: "Annaba", count: 38 },
            { name: "Constantine", count: 32 },
            { name: "Béjaïa", count: 28 }
          ],
          propertyTypes: [
            { type: "Appartement", count: 180 },
            { type: "Studio", count: 45 },
            { type: "Villa", count: 20 },
            { type: "Maison", count: 12 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Empty dependency array to prevent infinite loops

  const priceDistribution = [
    { range: "< 20K DA", count: 45, percentage: 17.5 },
    { range: "20K - 40K DA", count: 89, percentage: 34.6 },
    { range: "40K - 60K DA", count: 78, percentage: 30.4 },
    { range: "60K - 100K DA", count: 32, percentage: 12.5 },
    { range: "> 100K DA", count: 13, percentage: 5.1 }
  ]

  const monthlyTrends = [
    { month: "Jan", count: 38, avgPrice: 39500 },
    { month: "Fév", count: 42, avgPrice: 41200 },
    { month: "Mar", count: 45, avgPrice: 42800 },
    { month: "Avr", count: 41, avgPrice: 40900 },
    { month: "Mai", count: 48, avgPrice: 43500 },
    { month: "Jun", count: 43, avgPrice: 42100 }
  ]

  const pricePerSqmData = [
    { surface: 30, pricePerSqm: 1200, type: "Studio" },
    { surface: 60, pricePerSqm: 650, type: "F2" },
    { surface: 80, pricePerSqm: 550, type: "F3" },
    { surface: 100, pricePerSqm: 450, type: "F4" },
    { surface: 120, pricePerSqm: 400, type: "F5" },
    { surface: 150, pricePerSqm: 350, type: "Villa" }
  ]

  const rentalYield = [
    { wilaya: "Alger", avgRent: 52000, avgPrice: 35000000, yield: 1.8 },
    { wilaya: "Oran", avgRent: 38000, avgPrice: 25000000, yield: 1.8 },
    { wilaya: "Annaba", avgRent: 32000, avgPrice: 18000000, yield: 2.1 },
    { wilaya: "Constantine", avgRent: 28000, avgPrice: 16000000, yield: 2.1 },
    { wilaya: "Béjaïa", avgRent: 25000, avgPrice: 14000000, yield: 2.1 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Chargement des données de location...</p>
        </div>
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
                Tableau de Bord - Locations
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/sales" className="text-gray-700 hover:text-blue-600 transition-colors">
                Ventes
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors">
                Assistant IA
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalProperties || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loyer Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.averagePrice || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loyer Médian</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.medianPrice || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rendement Moyen</p>
                <p className="text-2xl font-bold text-gray-900">2.0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Price Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Loyers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(value as number), 'Nombre']} />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Wilayas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Wilayas - Location</h3>
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

        {/* Price per Square Meter Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix au m² par Type de Propriété</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={pricePerSqmData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="surface" name="Surface" unit=" m²" />
              <YAxis dataKey="pricePerSqm" name="Prix/m²" unit=" DA" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'surface' ? `${value} m²` : `${formatNumber(value as number)} DA/m²`,
                  name === 'surface' ? 'Surface' : 'Prix par m²'
                ]}
              />
              <Scatter dataKey="pricePerSqm" fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances Mensuelles - Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? formatNumber(value as number) : formatPrice(value as number),
                  name === 'count' ? 'Nombre d\'annonces' : 'Loyer moyen'
                ]}
              />
              <Bar yAxisId="left" dataKey="count" fill="#10B981" />
              <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rental Yield Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse du Rendement Locatif par Wilaya</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyer Moyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Achat Moyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendement Annuel
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rentalYield.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.wilaya}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.avgRent)}/mois
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.avgPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.yield >= 2.0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.yield}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Property Types */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de Propriétés en Location</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.propertyTypes.map((type, index) => (
              <div key={type.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatNumber(type.count)}</div>
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
            <h3 className="text-lg font-semibold text-gray-900">Annonces de Location Récentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyer/Mois
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
                {properties.slice(0, 10).map((property, index) => (
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
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {property.PropertyType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}