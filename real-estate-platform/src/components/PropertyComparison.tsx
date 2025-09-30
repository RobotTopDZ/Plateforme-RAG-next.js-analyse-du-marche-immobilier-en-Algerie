'use client'

import { useState } from 'react'
import { Property } from '@/types'
import { formatPrice, formatNumber } from '@/lib/utils'
import { X, Plus, MapPin, Home, Ruler, DollarSign, Calendar, ExternalLink } from 'lucide-react'

interface PropertyComparisonProps {
  properties: Property[]
  onClose: () => void
}

export default function PropertyComparison({ properties: allProperties, onClose }: PropertyComparisonProps) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProperties = allProperties.filter(property =>
    property.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.Wilaya.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10)

  const addProperty = (property: Property) => {
    if (selectedProperties.length < 4 && !selectedProperties.find(p => p.Title === property.Title)) {
      setSelectedProperties([...selectedProperties, property])
    }
  }

  const removeProperty = (property: Property) => {
    setSelectedProperties(selectedProperties.filter(p => p.Title !== property.Title))
  }

  const getComparisonMetrics = () => {
    if (selectedProperties.length < 2) return null

    const prices = selectedProperties.map(p => p.Price)
    const surfaces = selectedProperties.map(p => p.Surface).filter(s => s !== undefined) as number[]
    const pricesPerSqm = selectedProperties.map(p => p.PricePerSqm).filter(p => p !== undefined) as number[]

    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
      },
      surfaceRange: surfaces.length > 0 ? {
        min: Math.min(...surfaces),
        max: Math.max(...surfaces),
        avg: surfaces.reduce((sum, surface) => sum + surface, 0) / surfaces.length
      } : null,
      pricePerSqmRange: pricesPerSqm.length > 0 ? {
        min: Math.min(...pricesPerSqm),
        max: Math.max(...pricesPerSqm),
        avg: pricesPerSqm.reduce((sum, price) => sum + price, 0) / pricesPerSqm.length
      } : null
    }
  }

  const metrics = getComparisonMetrics()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Comparaison de Propriétés</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Property Selection Sidebar */}
          <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher une propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              {filteredProperties.map((property, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addProperty(property)}
                >
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {property.Title.substring(0, 50)}...
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {property.Location}, {property.Wilaya}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-600">
                      {formatPrice(property.Price)}
                    </span>
                    {property.Surface && (
                      <span className="text-gray-500">
                        {property.Surface} m²
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedProperties.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez des propriétés à comparer</p>
                  <p className="text-sm">Vous pouvez comparer jusqu'à 4 propriétés</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Comparison Metrics */}
                {metrics && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Analyse Comparative</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700">Prix</div>
                        <div className="text-gray-600">
                          Min: {formatPrice(metrics.priceRange.min)}
                        </div>
                        <div className="text-gray-600">
                          Max: {formatPrice(metrics.priceRange.max)}
                        </div>
                        <div className="text-gray-600">
                          Moy: {formatPrice(metrics.priceRange.avg)}
                        </div>
                      </div>
                      
                      {metrics.surfaceRange && (
                        <div>
                          <div className="font-medium text-gray-700">Surface</div>
                          <div className="text-gray-600">
                            Min: {formatNumber(metrics.surfaceRange.min)} m²
                          </div>
                          <div className="text-gray-600">
                            Max: {formatNumber(metrics.surfaceRange.max)} m²
                          </div>
                          <div className="text-gray-600">
                            Moy: {formatNumber(metrics.surfaceRange.avg)} m²
                          </div>
                        </div>
                      )}
                      
                      {metrics.pricePerSqmRange && (
                        <div>
                          <div className="font-medium text-gray-700">Prix/m²</div>
                          <div className="text-gray-600">
                            Min: {formatPrice(metrics.pricePerSqmRange.min)}/m²
                          </div>
                          <div className="text-gray-600">
                            Max: {formatPrice(metrics.pricePerSqmRange.max)}/m²
                          </div>
                          <div className="text-gray-600">
                            Moy: {formatPrice(metrics.pricePerSqmRange.avg)}/m²
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Property Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedProperties.map((property, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeProperty(property)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>

                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">
                          {property.Title.substring(0, 40)}...
                        </h4>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{property.Location}, {property.Wilaya}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-semibold text-blue-600">
                              {formatPrice(property.Price)}
                            </span>
                          </div>
                          
                          {property.Surface && (
                            <div className="flex items-center space-x-1">
                              <Ruler className="h-3 w-3" />
                              <span>{property.Surface} m²</span>
                            </div>
                          )}
                          
                          {property.Rooms && (
                            <div className="flex items-center space-x-1">
                              <Home className="h-3 w-3" />
                              <span>{property.Rooms} pièces</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{property.Date}</span>
                          </div>
                          
                          {property.PricePerSqm && (
                            <div className="text-xs text-gray-500">
                              {formatPrice(property.PricePerSqm)}/m²
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          {property.Description.substring(0, 80)}...
                        </p>
                        
                        {property.Link && (
                          <a
                            href={property.Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Voir l'annonce</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more properties button */}
                {selectedProperties.length < 4 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Vous pouvez ajouter {4 - selectedProperties.length} propriété(s) de plus
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}