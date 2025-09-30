'use client'

import { useState } from 'react'
import { formatNumber, formatPrice } from '@/lib/utils'

interface WilayaData {
  name: string
  properties: number
  averagePrice: number
  coordinates: { x: number; y: number }
}

const algerianWilayas: WilayaData[] = [
  { name: "Adrar", properties: 12, averagePrice: 8500000, coordinates: { x: 15, y: 75 } },
  { name: "Chlef", properties: 45, averagePrice: 18500000, coordinates: { x: 25, y: 35 } },
  { name: "Laghouat", properties: 23, averagePrice: 12000000, coordinates: { x: 35, y: 60 } },
  { name: "Oum El Bouaghi", properties: 34, averagePrice: 14500000, coordinates: { x: 70, y: 45 } },
  { name: "Batna", properties: 67, averagePrice: 16800000, coordinates: { x: 65, y: 50 } },
  { name: "Béjaïa", properties: 464, averagePrice: 22500000, coordinates: { x: 55, y: 35 } },
  { name: "Biskra", properties: 28, averagePrice: 13200000, coordinates: { x: 60, y: 65 } },
  { name: "Béchar", properties: 15, averagePrice: 9800000, coordinates: { x: 20, y: 70 } },
  { name: "Blida", properties: 89, averagePrice: 28500000, coordinates: { x: 35, y: 35 } },
  { name: "Bouira", properties: 56, averagePrice: 19200000, coordinates: { x: 45, y: 40 } },
  { name: "Tamanrasset", properties: 8, averagePrice: 7500000, coordinates: { x: 55, y: 90 } },
  { name: "Tébessa", properties: 31, averagePrice: 13800000, coordinates: { x: 80, y: 50 } },
  { name: "Tlemcen", properties: 42, averagePrice: 17500000, coordinates: { x: 15, y: 45 } },
  { name: "Tiaret", properties: 38, averagePrice: 15200000, coordinates: { x: 25, y: 50 } },
  { name: "Tizi Ouzou", properties: 156, averagePrice: 24800000, coordinates: { x: 45, y: 35 } },
  { name: "Alger", properties: 250, averagePrice: 45200000, coordinates: { x: 40, y: 30 } },
  { name: "Djelfa", properties: 29, averagePrice: 11500000, coordinates: { x: 40, y: 60 } },
  { name: "Jijel", properties: 78, averagePrice: 21200000, coordinates: { x: 60, y: 30 } },
  { name: "Sétif", properties: 92, averagePrice: 18900000, coordinates: { x: 55, y: 45 } },
  { name: "Saïda", properties: 26, averagePrice: 14200000, coordinates: { x: 20, y: 55 } },
  { name: "Skikda", properties: 67, averagePrice: 19800000, coordinates: { x: 65, y: 30 } },
  { name: "Sidi Bel Abbès", properties: 41, averagePrice: 16500000, coordinates: { x: 20, y: 50 } },
  { name: "Annaba", properties: 396, averagePrice: 20500000, coordinates: { x: 75, y: 35 } },
  { name: "Guelma", properties: 48, averagePrice: 17200000, coordinates: { x: 75, y: 40 } },
  { name: "Constantine", properties: 134, averagePrice: 22800000, coordinates: { x: 65, y: 40 } },
  { name: "Médéa", properties: 52, averagePrice: 18200000, coordinates: { x: 35, y: 45 } },
  { name: "Mostaganem", properties: 39, averagePrice: 17800000, coordinates: { x: 20, y: 40 } },
  { name: "M'Sila", properties: 33, averagePrice: 12800000, coordinates: { x: 45, y: 55 } },
  { name: "Mascara", properties: 35, averagePrice: 15800000, coordinates: { x: 20, y: 45 } },
  { name: "Ouargla", properties: 18, averagePrice: 10500000, coordinates: { x: 55, y: 75 } },
  { name: "Oran", properties: 105, averagePrice: 32500000, coordinates: { x: 15, y: 40 } },
  { name: "El Bayadh", properties: 14, averagePrice: 9200000, coordinates: { x: 25, y: 65 } },
  { name: "Illizi", properties: 5, averagePrice: 6800000, coordinates: { x: 80, y: 85 } },
  { name: "Bordj Bou Arréridj", properties: 44, averagePrice: 16200000, coordinates: { x: 50, y: 45 } },
  { name: "Boumerdès", properties: 36, averagePrice: 26500000, coordinates: { x: 45, y: 30 } },
  { name: "El Tarf", properties: 29, averagePrice: 18500000, coordinates: { x: 80, y: 35 } },
  { name: "Tindouf", properties: 3, averagePrice: 5500000, coordinates: { x: 10, y: 80 } },
  { name: "Tissemsilt", properties: 22, averagePrice: 13500000, coordinates: { x: 30, y: 50 } },
  { name: "El Oued", properties: 25, averagePrice: 11200000, coordinates: { x: 70, y: 70 } },
  { name: "Khenchela", properties: 27, averagePrice: 14800000, coordinates: { x: 70, y: 55 } },
  { name: "Souk Ahras", properties: 32, averagePrice: 15500000, coordinates: { x: 80, y: 45 } },
  { name: "Tipaza", properties: 58, averagePrice: 31200000, coordinates: { x: 35, y: 30 } },
  { name: "Mila", properties: 36, averagePrice: 16800000, coordinates: { x: 65, y: 45 } },
  { name: "Aïn Defla", properties: 41, averagePrice: 17500000, coordinates: { x: 30, y: 40 } },
  { name: "Naâma", properties: 11, averagePrice: 8800000, coordinates: { x: 15, y: 60 } },
  { name: "Aïn Témouchent", properties: 28, averagePrice: 16200000, coordinates: { x: 15, y: 42 } },
  { name: "Ghardaïa", properties: 19, averagePrice: 10800000, coordinates: { x: 40, y: 70 } },
  { name: "Relizane", properties: 33, averagePrice: 15200000, coordinates: { x: 25, y: 45 } }
]

interface AlgerianMapProps {
  selectedWilaya?: string
  onWilayaSelect?: (wilaya: string) => void
  showPrices?: boolean
}

export default function AlgerianMap({ selectedWilaya, onWilayaSelect, showPrices = true }: AlgerianMapProps) {
  const [hoveredWilaya, setHoveredWilaya] = useState<string | null>(null)

  const getCircleSize = (properties: number) => {
    const minSize = 4
    const maxSize = 20
    const maxProperties = Math.max(...algerianWilayas.map(w => w.properties))
    return minSize + (properties / maxProperties) * (maxSize - minSize)
  }

  const getCircleColor = (properties: number) => {
    if (properties > 200) return '#DC2626' // Red for high activity
    if (properties > 100) return '#EA580C' // Orange
    if (properties > 50) return '#D97706' // Amber
    if (properties > 20) return '#65A30D' // Lime
    return '#16A34A' // Green for low activity
  }

  const handleWilayaClick = (wilaya: WilayaData) => {
    if (onWilayaSelect) {
      onWilayaSelect(wilaya.name)
    }
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Map Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold text-gray-800">Carte de l'Algérie</h3>
        <p className="text-sm text-gray-600">Distribution des propriétés par wilaya</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">Nombre de propriétés</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>&gt; 200</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>100-200</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span>50-100</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-lime-600"></div>
            <span>20-50</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>&lt; 20</span>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #f0f9ff, #f0fdf4)' }}
      >
        {/* Algeria outline (simplified) */}
        <path
          d="M10,30 L90,30 L90,35 L85,40 L85,50 L80,55 L75,60 L70,70 L60,80 L50,85 L40,80 L30,75 L20,70 L15,60 L10,50 Z"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="0.5"
          opacity="0.3"
        />
        
        {/* Sahara region indicator */}
        <rect
          x="20"
          y="60"
          width="60"
          height="30"
          fill="#FEF3C7"
          opacity="0.2"
          rx="5"
        />
        <text x="50" y="78" textAnchor="middle" className="text-xs fill-amber-600" opacity="0.6">
          Sahara
        </text>

        {/* Mediterranean coast */}
        <path
          d="M15,30 Q50,25 85,30"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
          opacity="0.4"
        />
        <text x="50" y="25" textAnchor="middle" className="text-xs fill-blue-600" opacity="0.6">
          Méditerranée
        </text>

        {/* Wilaya circles */}
        {algerianWilayas.map((wilaya) => (
          <g key={wilaya.name}>
            <circle
              cx={wilaya.coordinates.x}
              cy={wilaya.coordinates.y}
              r={getCircleSize(wilaya.properties)}
              fill={getCircleColor(wilaya.properties)}
              opacity={selectedWilaya === wilaya.name ? 1 : 0.8}
              stroke={selectedWilaya === wilaya.name ? '#1F2937' : 'white'}
              strokeWidth={selectedWilaya === wilaya.name ? 2 : 1}
              className="cursor-pointer transition-all duration-200 hover:opacity-100"
              onMouseEnter={() => setHoveredWilaya(wilaya.name)}
              onMouseLeave={() => setHoveredWilaya(null)}
              onClick={() => handleWilayaClick(wilaya)}
            />
            
            {/* Wilaya labels for major cities */}
            {wilaya.properties > 50 && (
              <text
                x={wilaya.coordinates.x}
                y={wilaya.coordinates.y + getCircleSize(wilaya.properties) + 8}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700 pointer-events-none"
                opacity={hoveredWilaya === wilaya.name || selectedWilaya === wilaya.name ? 1 : 0.7}
              >
                {wilaya.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredWilaya && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 z-10">
          {(() => {
            const wilaya = algerianWilayas.find(w => w.name === hoveredWilaya)
            if (!wilaya) return null
            
            return (
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{wilaya.name}</div>
                <div className="text-gray-600">
                  {formatNumber(wilaya.properties)} propriétés
                </div>
                {showPrices && (
                  <div className="text-gray-600">
                    Prix moyen: {formatPrice(wilaya.averagePrice)}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}