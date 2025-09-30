import React from 'react';
import { Property } from '@/types/property';
import { PropertyRecommendation } from '@/lib/chatbot-engine';
import { MapPin, Home, Ruler, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  recommendation?: PropertyRecommendation;
  showRecommendationScore?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  recommendation, 
  showRecommendationScore = false 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getTransactionTypeColor = (type: string) => {
    return type?.toLowerCase() === 'vente' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appartement':
        return '🏢';
      case 'villa':
        return '🏡';
      case 'terrain':
        return '🏞️';
      case 'local':
        return '🏪';
      default:
        return '🏠';
    }
  };

  const getImageUrl = (imageUrls: string) => {
    if (!imageUrls) return '/placeholder-property.jpg';
    const urls = imageUrls.split(',').map(url => url.trim());
    return urls[0] || '/placeholder-property.jpg';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(property.ImageURLs || '')}
          alt={property.Title || 'Property'}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
          }}
        />
        
        {/* Transaction Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(property.TransactionType || '')}`}>
          {property.TransactionType}
        </div>
        
        {/* Recommendation Score */}
        {showRecommendationScore && recommendation && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {Math.round(recommendation.score * 100)}%
          </div>
        )}
        
        {/* Property Type Icon */}
        <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 rounded-full p-2 text-lg">
          {getPropertyTypeIcon(property.PropertyType || '')}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {property.Title || `${property.PropertyType} à ${property.Location}`}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{property.Location}, {property.Wilaya}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Price */}
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-green-600">
                {property.Price ? formatPrice(property.Price) : 'Prix sur demande'}
              </div>
              {property.PricePerSqm && (
                <div className="text-xs text-gray-500">
                  {formatNumber(property.PricePerSqm)} DA/m²
                </div>
              )}
            </div>
          </div>

          {/* Surface */}
          {property.Surface && (
            <div className="flex items-center">
              <Ruler className="w-4 h-4 text-blue-600 mr-2" />
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(property.Surface)} m²
                </div>
                <div className="text-xs text-gray-500">Surface</div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          {property.Rooms && (
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1" />
              <span>{property.Rooms} pièces</span>
            </div>
          )}
          
          {property.Date && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(property.Date).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {property.Description && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-3">
              {property.Description.length > 150 
                ? `${property.Description.substring(0, 150)}...` 
                : property.Description}
            </p>
          </div>
        )}

        {/* Recommendation Reasons */}
        {recommendation && recommendation.reasons.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-semibold text-yellow-800">Pourquoi cette propriété ?</span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              {recommendation.reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Market Insights */}
        {recommendation && recommendation.marketInsights && recommendation.marketInsights.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-800 mb-1">Analyse du marché</div>
            <p className="text-xs text-blue-700">
              {recommendation.marketInsights[0]}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            Voir détails
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            Contacter
          </button>
        </div>

        {/* Source Link */}
        {property.Link && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a
              href={property.Link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Voir l'annonce originale →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};