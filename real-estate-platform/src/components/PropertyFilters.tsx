'use client'

import { useState } from 'react'
import { Property } from '@/types'
import { Search, Filter, X, MapPin, Home, Ruler, DollarSign, Calendar } from 'lucide-react'

interface PropertyFiltersProps {
  properties: Property[]
  onFilteredProperties: (filtered: Property[]) => void
  transactionType: 'sales' | 'rental'
}

interface FilterState {
  search: string
  wilaya: string
  location: string
  priceMin: string
  priceMax: string
  surfaceMin: string
  surfaceMax: string
  roomsMin: string
  roomsMax: string
  propertyType: string
  dateFrom: string
  dateTo: string
}

export default function PropertyFilters({ properties, onFilteredProperties, transactionType }: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    wilaya: '',
    location: '',
    priceMin: '',
    priceMax: '',
    surfaceMin: '',
    surfaceMax: '',
    roomsMin: '',
    roomsMax: '',
    propertyType: '',
    dateFrom: '',
    dateTo: ''
  })

  // Get unique values for dropdowns
  const uniqueWilayas = [...new Set(properties.map(p => p.Wilaya))].sort()
  const uniqueLocations = [...new Set(properties.map(p => p.Location))].sort()
  const uniquePropertyTypes = [...new Set(properties.map(p => p.PropertyType).filter(Boolean))].sort()

  const applyFilters = () => {
    let filtered = properties

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(property =>
        property.Title.toLowerCase().includes(searchLower) ||
        property.Description.toLowerCase().includes(searchLower) ||
        property.Location.toLowerCase().includes(searchLower) ||
        property.Wilaya.toLowerCase().includes(searchLower)
      )
    }

    // Wilaya filter
    if (filters.wilaya) {
      filtered = filtered.filter(property => property.Wilaya === filters.wilaya)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property => property.Location === filters.location)
    }

    // Price filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      filtered = filtered.filter(property => property.Price >= minPrice)
    }
    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      filtered = filtered.filter(property => property.Price <= maxPrice)
    }

    // Surface filters
    if (filters.surfaceMin) {
      const minSurface = parseFloat(filters.surfaceMin)
      filtered = filtered.filter(property => property.Surface && property.Surface >= minSurface)
    }
    if (filters.surfaceMax) {
      const maxSurface = parseFloat(filters.surfaceMax)
      filtered = filtered.filter(property => property.Surface && property.Surface <= maxSurface)
    }

    // Rooms filters
    if (filters.roomsMin) {
      const minRooms = parseInt(filters.roomsMin)
      filtered = filtered.filter(property => property.Rooms && property.Rooms >= minRooms)
    }
    if (filters.roomsMax) {
      const maxRooms = parseInt(filters.roomsMax)
      filtered = filtered.filter(property => property.Rooms && property.Rooms <= maxRooms)
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.PropertyType === filters.propertyType)
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(property => new Date(property.Date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(property => new Date(property.Date) <= new Date(filters.dateTo))
    }

    onFilteredProperties(filtered)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      wilaya: '',
      location: '',
      priceMin: '',
      priceMax: '',
      surfaceMin: '',
      surfaceMax: '',
      roomsMin: '',
      roomsMax: '',
      propertyType: '',
      dateFrom: '',
      dateTo: ''
    })
    onFilteredProperties(properties)
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Apply filters immediately for search
    if (key === 'search') {
      setTimeout(() => {
        applyFilters()
      }, 300)
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, description, localisation..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
          <span>Filtres avancés</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Wilaya
              </label>
              <select
                value={filters.wilaya}
                onChange={(e) => updateFilter('wilaya', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les wilayas</option>
                {uniqueWilayas.map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Commune
              </label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les communes</option>
                {uniqueLocations
                  .filter(location => !filters.wilaya || properties.some(p => p.Location === location && p.Wilaya === filters.wilaya))
                  .map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Prix ({transactionType === 'sales' ? 'Vente' : 'Location'})
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Prix minimum"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Prix maximum"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Surface Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="inline h-4 w-4 mr-1" />
              Surface (m²)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Surface minimum"
                value={filters.surfaceMin}
                onChange={(e) => updateFilter('surfaceMin', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Surface maximum"
                value={filters.surfaceMax}
                onChange={(e) => updateFilter('surfaceMax', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rooms Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="inline h-4 w-4 mr-1" />
              Nombre de pièces
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Minimum"
                value={filters.roomsMin}
                onChange={(e) => updateFilter('roomsMin', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Maximum"
                value={filters.roomsMax}
                onChange={(e) => updateFilter('roomsMax', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="inline h-4 w-4 mr-1" />
              Type de propriété
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => updateFilter('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              {uniquePropertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Période de publication
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Effacer les filtres</span>
            </button>
            
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  )
}