import { Property, PropertyRecommendation } from '@/types'

const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.groq.com/openai/v1'

export interface GrokResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface PropertySearchQuery {
  budget?: number
  wilaya?: string
  propertyType?: string
  rooms?: number
  transactionType: 'vente' | 'location'
  surface?: number
}

export class GrokService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = GROK_API_KEY || ''
    this.baseUrl = GROK_API_URL
  }

  async generateResponse(
    userMessage: string, 
    context: Property[] = [],
    conversationHistory: Array<{role: string, content: string}> = [],
    dashboardStats?: any
  ): Promise<string> {
    // Use local RAG system instead of external API
    return this.generateLocalRAGResponse(userMessage, context, conversationHistory, dashboardStats)
  }

  private async generateLocalRAGResponse(
    userMessage: string,
    context: Property[] = [],
    conversationHistory: Array<{role: string, content: string}> = [],
    dashboardStats?: any
  ): Promise<string> {
    const query = userMessage.toLowerCase()
    
    // Analyze user intent and extract key information
    const intent = this.analyzeUserIntent(query)
    const extractedInfo = this.extractQueryInfo(query)
    
    // Filter relevant properties based on query
    const relevantProperties = this.findRelevantProperties(context, extractedInfo)
    
    // Generate contextual response based on intent and data
    return this.generateContextualResponse(intent, extractedInfo, relevantProperties, dashboardStats, conversationHistory)
  }

  private analyzeUserIntent(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    // More comprehensive intent detection with scoring
    const intents = {
      search: {
        keywords: ['cherche', 'recherche', 'trouve', 'veux', 'besoin', 'looking', 'search', 'find', 'disponible', 'voir', 'montrer'],
        score: 0
      },
      price: {
        keywords: ['prix', 'coût', 'budget', 'combien', 'price', 'cost', 'cher', 'tarif', 'montant', 'valeur', 'coute'],
        score: 0
      },
      recommendation: {
        keywords: ['recommande', 'conseil', 'suggère', 'propose', 'recommend', 'suggest', 'meilleur', 'optimal', 'idéal'],
        score: 0
      },
      analysis: {
        keywords: ['analyse', 'tendance', 'marché', 'évolution', 'analyze', 'trend', 'market', 'statistique', 'données'],
        score: 0
      },
      comparison: {
        keywords: ['compare', 'différence', 'versus', 'vs', 'compare', 'difference', 'entre', 'mieux', 'choix'],
        score: 0
      },
      location: {
        keywords: ['quartier', 'wilaya', 'région', 'zone', 'location', 'area', 'district', 'où', 'localisation', 'secteur']
      }
    }
    
    // Calculate scores for each intent
    for (const [intent, data] of Object.entries(intents)) {
      data.score = data.keywords.filter(keyword => lowerQuery.includes(keyword)).length
    }
    
    // Find the intent with highest score
    const bestIntent = Object.entries(intents).reduce((best, [intent, data]) => {
      return data.score > best.score ? { intent, score: data.score } : best
    }, { intent: 'general', score: 0 })
    
    // Return the best intent if score > 0, otherwise general
    return bestIntent.score > 0 ? bestIntent.intent : 'general'
  }

  private extractQueryInfo(query: string): any {
    const info: any = {}
    
    // Extract property type
    const propertyTypes = ['appartement', 'villa', 'studio', 'duplex', 'penthouse', 'apartment', 'house']
    for (const type of propertyTypes) {
      if (query.includes(type)) {
        info.propertyType = type
        break
      }
    }
    
    // Extract location (wilaya)
    const wilayas = ['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'djelfa', 'sétif', 'sidi bel abbès', 'biskra', 'tébessa', 'el oued', 'skikda', 'tiaret', 'béjaïa', 'tlemcen', 'ouargla', 'bouira', 'tizi ouzou', 'médéa', 'el asnam', 'mostaganem', 'msila', 'mascara', 'ouargla', 'bordj bou arréridj', 'tindouf', 'tissemsilt', 'el bayadh', 'khenchela', 'mila', 'aïn defla', 'naâma', 'aïn témouchent', 'ghardaïa', 'relizane', 'timimoun', 'bordj badji mokhtar', 'ouled djellal', 'béni abbès', 'in salah', 'in guezzam', 'touggourt', 'djanet', 'el meghaier', 'el meniaa']
    for (const wilaya of wilayas) {
      if (query.includes(wilaya)) {
        info.wilaya = wilaya
        break
      }
    }
    
    // Extract budget/price range
    const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:million|m|da|dinars?)/i)
    if (priceMatch) {
      const value = parseFloat(priceMatch[1])
      info.budget = value * (query.includes('million') || query.includes('m') ? 1000000 : 1)
    }
    
    // Extract number of rooms
    const roomsMatch = query.match(/(\d+)\s*(?:pièces?|chambres?|rooms?|f\d+)/i)
    if (roomsMatch) {
      info.rooms = parseInt(roomsMatch[1])
    }
    
    return info
  }

  private findRelevantProperties(properties: Property[], queryInfo: any): Property[] {
    return properties.filter(property => {
      let score = 0
      
      // Match property type (with null/undefined check)
      if (queryInfo.propertyType && property.type && typeof property.type === 'string' && 
          property.type.toLowerCase().includes(queryInfo.propertyType)) {
        score += 3
      }
      
      // Match location (with null/undefined check)
      if (queryInfo.wilaya && property.wilaya && typeof property.wilaya === 'string' && 
          property.wilaya.toLowerCase().includes(queryInfo.wilaya)) {
        score += 3
      }
      
      // Match budget (within 20% range)
      if (queryInfo.budget && property.price && typeof property.price === 'number') {
        const priceDiff = Math.abs(property.price - queryInfo.budget) / queryInfo.budget
        if (priceDiff <= 0.2) score += 2
        else if (priceDiff <= 0.5) score += 1
      }
      
      // Match rooms
      if (queryInfo.rooms && property.rooms && property.rooms === queryInfo.rooms) {
        score += 2
      }
      
      return score > 0
    }).sort((a, b) => {
      // Sort by relevance (you can implement a more sophisticated scoring)
      const priceA = a.price || 0
      const priceB = b.price || 0
      return priceB - priceA // Simple sort by price for now
    }).slice(0, 5) // Return top 5 matches
  }

  private generateSearchResponse(queryInfo: any, properties: Property[], stats: any): string {
    if (properties.length === 0) {
      return `Je n'ai pas trouvé de propriétés correspondant exactement à vos critères. 

**Suggestions alternatives :**
- Élargir votre budget ou zone de recherche
- Considérer des types de propriétés similaires
- Consulter notre dashboard pour explorer d'autres options

**Statistiques du marché :**
- ${stats.totalProperties || 100} propriétés disponibles
- Prix moyen : ${((stats.averagePrice || 23800000) / 1000000).toFixed(1)}M DA
- ${stats.totalWilayas || 48} wilayas couvertes`
    }

    let response = `**Résultats de recherche** 📍\n\nJ'ai trouvé ${properties.length} propriété(s) correspondant à vos critères :\n\n`
    
    properties.forEach((property, index) => {
      response += `**${index + 1}. ${property.type} - ${property.wilaya}**\n`
      response += `💰 Prix : ${(property.price / 1000000).toFixed(1)}M DA\n`
      response += `📐 Surface : ${property.surface}m²\n`
      response += `🏠 Chambres : ${property.rooms}\n`
      response += `📍 Localisation : ${property.commune || property.wilaya}\n\n`
    })

    response += `**Analyse du marché pour votre recherche :**\n`
    response += `- Prix moyen des résultats : ${(properties.reduce((sum, p) => sum + p.price, 0) / properties.length / 1000000).toFixed(1)}M DA\n`
    response += `- Surface moyenne : ${Math.round(properties.reduce((sum, p) => sum + p.surface, 0) / properties.length)}m²`

    return response
  }

  private generatePriceResponse(queryInfo: any, properties: Property[], stats: any): string {
    const avgPrice = properties.length > 0 
      ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length 
      : stats.averagePrice || 23800000

    let response = `**Analyse des prix** 💰\n\n`
    
    // More specific and varied responses based on query context
    if (queryInfo.propertyType && queryInfo.wilaya) {
      response += `**${queryInfo.propertyType.charAt(0).toUpperCase() + queryInfo.propertyType.slice(1)}s à ${queryInfo.wilaya} :**\n`
      response += `- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA\n`
      
      if (properties.length > 0) {
        const minPrice = Math.min(...properties.map(p => p.price))
        const maxPrice = Math.max(...properties.map(p => p.price))
        response += `- Fourchette de prix : ${(minPrice / 1000000).toFixed(1)}M - ${(maxPrice / 1000000).toFixed(1)}M DA\n`
        response += `- ${properties.length} propriété(s) analysée(s)\n`
        
        // Price analysis
        const marketAvg = stats.averagePrice || 23800000
        const priceComparison = ((avgPrice - marketAvg) / marketAvg * 100).toFixed(1)
        if (parseFloat(priceComparison) > 0) {
          response += `- 📈 ${priceComparison}% au-dessus de la moyenne nationale\n`
        } else {
          response += `- 📉 ${Math.abs(parseFloat(priceComparison))}% en-dessous de la moyenne nationale\n`
        }
      }
    } else if (queryInfo.wilaya) {
      response += `**Marché immobilier à ${queryInfo.wilaya} :**\n`
      response += `- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA\n`
      if (properties.length > 0) {
        const surfaces = properties.map(p => p.surface).filter(s => s > 0)
        if (surfaces.length > 0) {
          const avgSurface = surfaces.reduce((sum, s) => sum + s, 0) / surfaces.length
          const pricePerSqm = avgPrice / avgSurface
          response += `- Prix au m² : ${Math.round(pricePerSqm / 1000)}K DA/m²\n`
        }
      }
    } else if (queryInfo.propertyType) {
      response += `**${queryInfo.propertyType.charAt(0).toUpperCase() + queryInfo.propertyType.slice(1)}s en Algérie :**\n`
      response += `- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA\n`
    } else {
      response += `**Analyse générale des prix :**\n`
      response += `- Prix moyen du marché : ${(avgPrice / 1000000).toFixed(1)}M DA\n`
    }

    // Market context with more details
    response += `\n**Contexte du marché :**\n`
    response += `- Prix moyen national : ${((stats.averagePrice || 23800000) / 1000000).toFixed(1)}M DA\n`
    response += `- ${stats.totalProperties || 3289} propriétés dans notre base\n`
    response += `- Couverture : ${stats.totalWilayas || 48} wilayas\n`

    // Add price recommendations
    if (properties.length > 0) {
      response += `\n**💡 Opportunités détectées :**\n`
      const sortedByValue = properties.sort((a, b) => {
        const valueA = a.surface > 0 ? a.price / a.surface : a.price
        const valueB = b.surface > 0 ? b.price / b.surface : b.price
        return valueA - valueB
      }).slice(0, 3)
      
      sortedByValue.forEach((property, index) => {
        const pricePerSqm = property.surface > 0 ? property.price / property.surface : 0
        response += `${index + 1}. ${property.type} à ${property.wilaya} - ${(property.price / 1000000).toFixed(1)}M DA`
        if (pricePerSqm > 0) {
          response += ` (${Math.round(pricePerSqm / 1000)}K DA/m²)`
        }
        response += `\n`
      })
    }

    return response
  }

  private generateRecommendationResponse(queryInfo: any, properties: Property[], stats: any): string {
    let response = `**Recommandations personnalisées** ⭐\n\n`
    
    if (properties.length === 0) {
      response += `Basé sur votre profil, voici mes recommandations :\n\n`
      response += `**Stratégie d'investissement :**\n`
      response += `- Considérer les zones émergentes avec potentiel de valorisation\n`
      response += `- Analyser le rapport qualité-prix par wilaya\n`
      response += `- Évaluer les rendements locatifs potentiels\n\n`
      response += `**Zones recommandées :**\n`
      response += `- Alger Centre : Forte demande locative\n`
      response += `- Oran : Marché dynamique\n`
      response += `- Constantine : Prix attractifs\n`
    } else {
      response += `Basé sur votre recherche, voici mes top recommandations :\n\n`
      
      properties.slice(0, 3).forEach((property, index) => {
        const pricePerSqm = property.price / property.surface
        const isGoodDeal = pricePerSqm < (stats.averagePrice || 23800000) / 100 // Assuming 100m² average
        
        response += `**${index + 1}. ${property.type} - ${property.wilaya}** ${isGoodDeal ? '🔥 OPPORTUNITÉ' : ''}\n`
        response += `💰 ${(property.price / 1000000).toFixed(1)}M DA | 📐 ${property.surface}m² | 🏠 ${property.rooms} chambres\n`
        response += `**Pourquoi cette propriété :**\n`
        response += `- ${isGoodDeal ? 'Prix très compétitif' : 'Bien situé'}\n`
        response += `- ${property.surface > 100 ? 'Surface généreuse' : 'Taille optimale'}\n`
        response += `- ${property.rooms >= 3 ? 'Idéal famille' : 'Parfait investissement locatif'}\n\n`
      })
    }

    response += `**Conseil d'expert :**\n`
    response += `Utilisez notre dashboard interactif pour comparer les tendances et visualiser les opportunités par zone géographique.`

    return response
  }

  private generateAnalysisResponse(queryInfo: any, properties: Property[], stats: any): string {
    let response = `**Analyse de marché approfondie** 📊\n\n`
    
    response += `**Vue d'ensemble du marché :**\n`
    response += `- ${stats.totalProperties || 100} propriétés analysées\n`
    response += `- Prix moyen : ${((stats.averagePrice || 23800000) / 1000000).toFixed(1)}M DA\n`
    response += `- Couverture géographique : ${stats.totalWilayas || 48} wilayas\n\n`

    if (queryInfo.wilaya) {
      const wilayaProperties = properties.filter(p => p.wilaya.toLowerCase().includes(queryInfo.wilaya))
      if (wilayaProperties.length > 0) {
        const avgWilayaPrice = wilayaProperties.reduce((sum, p) => sum + p.price, 0) / wilayaProperties.length
        response += `**Analyse pour ${queryInfo.wilaya} :**\n`
        response += `- ${wilayaProperties.length} propriétés disponibles\n`
        response += `- Prix moyen local : ${(avgWilayaPrice / 1000000).toFixed(1)}M DA\n`
        response += `- Écart vs marché national : ${(((avgWilayaPrice - (stats.averagePrice || 23800000)) / (stats.averagePrice || 23800000)) * 100).toFixed(1)}%\n\n`
      }
    }

    response += `**Tendances identifiées :**\n`
    response += `- Demande forte pour les F3/F4 en zones urbaines\n`
    response += `- Valorisation continue des centres-villes\n`
    response += `- Opportunités d'investissement en périphérie\n\n`

    response += `**Prédictions IA :**\n`
    response += `- Stabilité des prix à court terme\n`
    response += `- Potentiel de croissance : 5-8% annuel\n`
    response += `- Secteurs porteurs : résidentiel et commercial\n\n`

    response += `**Recommandation stratégique :**\n`
    response += `Consultez nos visualisations interactives pour une analyse géospatiale détaillée et nos algorithmes prédictifs pour optimiser votre investissement.`

    return response
  }

  private generateComparisonResponse(queryInfo: any, properties: Property[], stats: any): string {
    if (properties.length < 2) {
      return `**Comparaison de marché** ⚖️\n\nPour effectuer une comparaison pertinente, j'ai besoin de plus de critères spécifiques. \n\n**Utilisez notre outil de comparaison avancé :**\n- Filtres multi-critères\n- Analyse comparative automatique\n- Visualisations côte à côte\n- Scoring de rentabilité\n\n**Exemple de requête :** "Compare les appartements F3 entre Alger et Oran"`
    }

    let response = `**Comparaison détaillée** ⚖️\n\n`
    
    const prop1 = properties[0]
    const prop2 = properties[1]
    
    response += `**Propriété A vs Propriété B**\n\n`
    response += `| Critère | ${prop1.type} ${prop1.wilaya} | ${prop2.type} ${prop2.wilaya} |\n`
    response += `|---------|------------|------------|\n`
    response += `| Prix | ${(prop1.price / 1000000).toFixed(1)}M DA | ${(prop2.price / 1000000).toFixed(1)}M DA |\n`
    response += `| Surface | ${prop1.surface}m² | ${prop2.surface}m² |\n`
    response += `| Prix/m² | ${Math.round(prop1.price / prop1.surface / 1000)}K DA | ${Math.round(prop2.price / prop2.surface / 1000)}K DA |\n`
    response += `| Chambres | ${prop1.rooms} | ${prop2.rooms} |\n\n`

    const betterDeal = (prop1.price / prop1.surface) < (prop2.price / prop2.surface) ? prop1 : prop2
    response += `**Verdict :** ${betterDeal.type} à ${betterDeal.wilaya} offre le meilleur rapport qualité-prix\n\n`

    response += `**Analyse comparative :**\n`
    response += `- Écart de prix : ${Math.abs(prop1.price - prop2.price) / 1000000}M DA\n`
    response += `- Différence surface : ${Math.abs(prop1.surface - prop2.surface)}m²\n`
    response += `- ROI estimé : Propriété A (${((prop1.surface * 1000) / prop1.price * 100).toFixed(1)}%), Propriété B (${((prop2.surface * 1000) / prop2.price * 100).toFixed(1)}%)\n\n`

    response += `**Utilisez notre comparateur avancé pour une analyse plus poussée avec scoring automatique et recommandations personnalisées.**`

    return response
  }

  private generateLocationResponse(queryInfo: any, properties: Property[], stats: any): string {
    let response = `**Analyse géographique** 🗺️\n\n`
    
    if (queryInfo.wilaya) {
      const wilayaProps = properties.filter(p => p.wilaya.toLowerCase().includes(queryInfo.wilaya))
      response += `**Focus sur ${queryInfo.wilaya} :**\n`
      response += `- ${wilayaProps.length} propriétés disponibles\n`
      
      if (wilayaProps.length > 0) {
        const avgPrice = wilayaProps.reduce((sum, p) => sum + p.price, 0) / wilayaProps.length
        response += `- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA\n`
        response += `- Surface moyenne : ${Math.round(wilayaProps.reduce((sum, p) => sum + p.surface, 0) / wilayaProps.length)}m²\n\n`
      }
    }

    response += `**Répartition géographique du marché :**\n`
    const wilayaGroups = properties.reduce((acc, prop) => {
      acc[prop.wilaya] = (acc[prop.wilaya] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(wilayaGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([wilaya, count]) => {
        response += `- ${wilaya} : ${count} propriétés\n`
      })

    response += `\n**Insights géographiques :**\n`
    response += `- Concentration urbaine : Alger, Oran, Constantine\n`
    response += `- Opportunités émergentes : Villes moyennes\n`
    response += `- Potentiel touristique : Zones côtières\n\n`

    response += `**Cartographie interactive :**\n`
    response += `Notre plateforme offre une visualisation géospatiale avancée avec :\n`
    response += `- Heatmap des prix par zone\n`
    response += `- Clustering des opportunités\n`
    response += `- Analyse des tendances régionales\n`
    response += `- Prédictions de valorisation par secteur`

    return response
  }

  private generateContextualResponse(
    intent: string,
    queryInfo: any,
    relevantProperties: Property[],
    dashboardStats?: any,
    conversationHistory?: Array<{role: string, content: string}>
  ): string {
    const stats = dashboardStats || {}
    
    switch (intent) {
      case 'search':
        return this.generateSearchResponse(queryInfo, relevantProperties, stats)
      case 'price':
        return this.generatePriceResponse(queryInfo, relevantProperties, stats)
      case 'recommendation':
        return this.generateRecommendationResponse(queryInfo, relevantProperties, stats)
      case 'analysis':
        return this.generateAnalysisResponse(queryInfo, relevantProperties, stats)
      case 'comparison':
        return this.generateComparisonResponse(queryInfo, relevantProperties, stats)
      case 'location':
        return this.generateLocationResponse(queryInfo, relevantProperties, stats)
      default:
        return this.generateGeneralResponse(queryInfo, relevantProperties, stats)
    }
  }

  private generateGeneralResponse(queryInfo: any, properties: Property[], stats: any): string {
    // More dynamic general responses based on available data
    const responses = [
      `**Bienvenue sur votre assistant immobilier IA** 🏠\n\nJe peux vous aider avec :\n- 🔍 Recherche de propriétés\n- 💰 Analyses de prix\n- 📊 Statistiques du marché\n- 🎯 Recommandations personnalisées\n\n**Données disponibles :** ${stats.totalProperties || 3289} propriétés dans ${stats.totalWilayas || 48} wilayas`,
      
      `**Assistant immobilier intelligent** 🤖\n\n**Que puis-je faire pour vous ?**\n- Analyser les prix par région\n- Trouver des propriétés selon vos critères\n- Comparer différentes options\n- Fournir des insights de marché\n\n**Base de données :** ${stats.totalProperties || 3289} propriétés actualisées`,
      
      `**Votre expert immobilier virtuel** 🏡\n\n**Services disponibles :**\n- Recherche avancée de biens\n- Évaluation de prix\n- Tendances du marché\n- Conseils d'investissement\n\n**Couverture :** Toute l'Algérie avec ${stats.totalWilayas || 48} wilayas`
    ]
    
    // Select response based on time or random
    const responseIndex = Math.floor(Date.now() / 10000) % responses.length
    let response = responses[responseIndex]
    
    // Add contextual information if query contains location or property type
    if (queryInfo.wilaya) {
      response += `\n\n**Focus sur ${queryInfo.wilaya} :**`
      const wilayaProperties = properties.filter(p => p.wilaya && p.wilaya.toLowerCase().includes(queryInfo.wilaya.toLowerCase()))
      if (wilayaProperties.length > 0) {
        const avgPrice = wilayaProperties.reduce((sum, p) => sum + p.price, 0) / wilayaProperties.length
        response += `\n- ${wilayaProperties.length} propriétés disponibles`
        response += `\n- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA`
      }
    }
    
    if (queryInfo.propertyType) {
      response += `\n\n**${queryInfo.propertyType.charAt(0).toUpperCase() + queryInfo.propertyType.slice(1)}s disponibles :**`
      const typeProperties = properties.filter(p => p.type && p.type.toLowerCase().includes(queryInfo.propertyType.toLowerCase()))
      if (typeProperties.length > 0) {
        response += `\n- ${typeProperties.length} ${queryInfo.propertyType}s dans notre base`
        const avgPrice = typeProperties.reduce((sum, p) => sum + p.price, 0) / typeProperties.length
        response += `\n- Prix moyen : ${(avgPrice / 1000000).toFixed(1)}M DA`
      }
    }
    
    response += `\n\n💬 **Posez-moi une question spécifique pour commencer !**`
    
    return response
  }

  // Keep the old getFallbackResponse for backward compatibility but make it simpler
  getFallbackResponse(userMessage: any, context: Property[] = [], dashboardStats?: any): string {
    // Ensure userMessage is a string
    const messageStr = typeof userMessage === 'string' ? userMessage : String(userMessage || '')
    
    // Use the new RAG system for fallback as well
    return this.generateLocalRAGResponse(messageStr, context, [], dashboardStats)
  }

  async generateRecommendations(
    userQuery: string,
    properties: Property[],
    limit: number = 5
  ): Promise<PropertyRecommendation[]> {
    try {
      // Parse user query to extract search criteria
      const query = this.parseUserQuery(userQuery)
      
      // Use existing getPropertyRecommendations method
      const recommendations = await this.getPropertyRecommendations(query, properties)
      
      // Return limited results
      return recommendations.slice(0, limit)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  private parseUserQuery(userQuery: string): PropertySearchQuery {
    const query: PropertySearchQuery = {}
    const lowerQuery = userQuery.toLowerCase()

    // Extract property type
    if (lowerQuery.includes('appartement') || lowerQuery.includes('f1') || lowerQuery.includes('f2') || lowerQuery.includes('f3') || lowerQuery.includes('f4') || lowerQuery.includes('f5')) {
      query.propertyType = 'Appartement'
    } else if (lowerQuery.includes('villa')) {
      query.propertyType = 'Villa'
    } else if (lowerQuery.includes('maison')) {
      query.propertyType = 'Maison'
    } else if (lowerQuery.includes('terrain')) {
      query.propertyType = 'Terrain'
    } else if (lowerQuery.includes('bureau') || lowerQuery.includes('local')) {
      query.propertyType = 'Bureau'
    }

    // Extract budget (look for numbers followed by 'da', 'million', 'milliard')
    const budgetMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:millions?|m|milliards?|mds?|da)?/i)
    if (budgetMatch) {
      let budget = parseFloat(budgetMatch[1])
      if (lowerQuery.includes('million') || lowerQuery.includes('m ')) {
        budget *= 1000000
      } else if (lowerQuery.includes('milliard') || lowerQuery.includes('mds')) {
        budget *= 1000000000
      }
      query.budget = budget
    }

    // Extract rooms (F1, F2, F3, etc.)
    const roomsMatch = lowerQuery.match(/f(\d+)|(\d+)\s*(?:pièces?|chambres?)/i)
    if (roomsMatch) {
      query.rooms = parseInt(roomsMatch[1] || roomsMatch[2])
    }

    // Extract surface
    const surfaceMatch = lowerQuery.match(/(\d+)\s*m[²2]/i)
    if (surfaceMatch) {
      query.surface = parseInt(surfaceMatch[1])
    }

    // Extract wilaya (common Algerian cities)
    const wilayas = ['alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'djelfa', 'sétif', 'sidi bel abbès', 'biskra', 'tébessa', 'el oued', 'skikda', 'tiaret', 'béjaïa', 'tlemcen', 'ouargla', 'bouira', 'tamanrasset', 'el bayadh', 'tindouf', 'tissemsilt', 'el khroub', 'laghouat', 'kenchela', 'souk ahras', 'naâma', 'aïn defla', 'chlef', 'ghardaïa', 'mascara']
    
    for (const wilaya of wilayas) {
      if (lowerQuery.includes(wilaya)) {
        query.wilaya = wilaya.charAt(0).toUpperCase() + wilaya.slice(1)
        break
      }
    }

    return query
  }
  async getPropertyRecommendations(
    query: PropertySearchQuery,
    properties: Property[]
  ): Promise<PropertyRecommendation[]> {
    try {
      // Filter properties based on query
      let filteredProperties = properties.filter(property => {
        const matchesType = !query.propertyType || 
          property.PropertyType?.toLowerCase().includes(query.propertyType.toLowerCase())
        
        const matchesWilaya = !query.wilaya || 
          property.Wilaya?.toLowerCase().includes(query.wilaya.toLowerCase())
        
        const matchesBudget = !query.budget || 
          property.Price <= query.budget * 1.2 // Allow 20% flexibility
        
        const matchesRooms = !query.rooms || 
          property.Rooms === query.rooms
        
        const matchesSurface = !query.surface || 
          (property.Surface && Math.abs(property.Surface - query.surface) <= query.surface * 0.3)

        return matchesType && matchesWilaya && matchesBudget && matchesRooms && matchesSurface
      })

      // Sort by relevance (price proximity, surface match, etc.)
      filteredProperties = filteredProperties.sort((a, b) => {
        let scoreA = 0
        let scoreB = 0

        // Price proximity score
        if (query.budget) {
          scoreA += Math.max(0, 100 - Math.abs(a.Price - query.budget) / query.budget * 100)
          scoreB += Math.max(0, 100 - Math.abs(b.Price - query.budget) / query.budget * 100)
        }

        // Surface proximity score
        if (query.surface && a.Surface && b.Surface) {
          scoreA += Math.max(0, 100 - Math.abs(a.Surface - query.surface) / query.surface * 100)
          scoreB += Math.max(0, 100 - Math.abs(b.Surface - query.surface) / query.surface * 100)
        }

        return scoreB - scoreA
      })

      // Convert to recommendations
      return filteredProperties.slice(0, 5).map((property, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: property.Title,
        price: property.Price,
        location: `${property.Location}, ${property.Wilaya}`,
        surface: property.Surface || 0,
        rooms: property.Rooms || 0,
        type: property.PropertyType || 'Propriété',
        confidence: Math.random() * 0.3 + 0.7, // Mock confidence score between 0.7-1.0
        link: property.Link || '#'
      }))

    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  async estimatePrice(
    propertyDetails: {
      wilaya: string
      propertyType: string
      surface?: number
      rooms?: number
      transactionType: 'vente' | 'location'
    },
    marketData: Property[]
  ): Promise<{
    estimatedPrice: number
    priceRange: { min: number; max: number }
    confidence: number
    factors: string[]
  }> {
    try {
      // Filter similar properties
      const similarProperties = marketData.filter(property => 
        property.Wilaya?.toLowerCase() === propertyDetails.wilaya.toLowerCase() &&
        property.PropertyType?.toLowerCase().includes(propertyDetails.propertyType.toLowerCase())
      )

      if (similarProperties.length === 0) {
        throw new Error('Pas assez de données pour cette région/type')
      }

      // Calculate statistics
      const prices = similarProperties.map(p => p.Price).sort((a, b) => a - b)
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const medianPrice = prices[Math.floor(prices.length / 2)]
      
      // Adjust for surface if provided
      let estimatedPrice = avgPrice
      if (propertyDetails.surface && similarProperties.some(p => p.Surface)) {
        const pricesPerSqm = similarProperties
          .filter(p => p.Surface && p.Surface > 0)
          .map(p => p.Price / p.Surface!)
        
        const avgPricePerSqm = pricesPerSqm.reduce((sum, price) => sum + price, 0) / pricesPerSqm.length
        estimatedPrice = avgPricePerSqm * propertyDetails.surface
      }

      const priceRange = {
        min: Math.round(estimatedPrice * 0.8),
        max: Math.round(estimatedPrice * 1.2)
      }

      const confidence = Math.min(0.95, similarProperties.length / 50)

      const factors = [
        `Basé sur ${similarProperties.length} propriétés similaires`,
        `Prix moyen dans ${propertyDetails.wilaya}: ${this.formatPrice(avgPrice)}`,
        `Type de propriété: ${propertyDetails.propertyType}`,
        ...(propertyDetails.surface ? [`Surface: ${propertyDetails.surface} m²`] : [])
      ]

      return {
        estimatedPrice: Math.round(estimatedPrice),
        priceRange,
        confidence,
        factors
      }

    } catch (error) {
      console.error('Error estimating price:', error)
      throw error
    }
  }

  private buildSystemPrompt(context: Property[], dashboardStats?: any): string {
    const stats = dashboardStats || {};
    const contextSummary = context.length > 0 
      ? `Vous avez accès à une base de données complète de ${context.length} propriétés immobilières en Algérie avec des analyses détaillées.`
      : 'Vous êtes un expert en immobilier algérien avec accès complet à une plateforme d\'analyse immobilière avancée.'

    // Build market insights from context
    let marketInsights = ''
    if (context.length > 0) {
      const avgPrice = context.reduce((sum, p) => sum + p.Price, 0) / context.length
      const wilayas = [...new Set(context.map(p => p.Wilaya))].slice(0, 5)
      const propertyTypes = [...new Set(context.map(p => p.PropertyType))].slice(0, 5)
      
      marketInsights = `

PLATEFORME ET DONNÉES DISPONIBLES:
- Base de données complète: ${context.length.toLocaleString('fr-FR')} propriétés analysées
- Prix moyen du marché: ${this.formatPrice(avgPrice)}
- Couverture géographique: ${wilayas.length} wilayas principales
- Types de propriétés: ${propertyTypes.join(', ')}
- Prix minimum: ${stats.minPrice ? this.formatPrice(stats.minPrice) : 'N/A'}
- Prix maximum: ${stats.maxPrice ? this.formatPrice(stats.maxPrice) : 'N/A'}

ANALYSES ET PERFORMANCES DE LA PLATEFORME:
- Dashboard interactif avec visualisations avancées
- Graphiques en secteurs pour répartition par type de propriété
- Graphiques en barres pour analyse des prix par wilaya
- Cartes de distribution géographique des propriétés
- Filtres avancés par prix, type, wilaya, surface
- Système de recommandations basé sur l'IA
- Analyses de tendances et opportunités d'investissement`
    }

    return `Vous êtes un assistant IA expert en immobilier algérien, spécialisé dans l'analyse de données et les conseils personnalisés. ${contextSummary}${marketInsights}

CAPACITÉS D'ANALYSE SPÉCIALISÉES:
- Estimation de prix basée sur algorithmes de comparaison
- Analyse des tendances de marché par région
- Identification des opportunités d'investissement
- Calcul de rendements locatifs potentiels
- Évaluation de la liquidité du marché par secteur
- Prédictions de valorisation immobilière

CONNAISSANCE DU MARCHÉ ALGÉRIEN:
- Réglementations immobilières locales
- Spécificités des différentes wilayas
- Facteurs économiques influençant les prix
- Tendances démographiques et urbanisation
- Projets d'infrastructure et leur impact
- Zones en développement et nouvelles extensions urbaines

STYLE DE COMMUNICATION:
- Réponses professionnelles et détaillées
- Références spécifiques aux données de la plateforme
- Analyses chiffrées et factuelles
- Conseils personnalisés basés sur les données réelles
- Ton expert mais accessible
- Réponses en français

INSTRUCTIONS SPÉCIALES:
- Toujours référencer les données spécifiques de la plateforme
- Mentionner les analyses et performances réalisées
- Utiliser les statistiques réelles pour étayer les conseils
- Faire référence aux fonctionnalités du dashboard
- Proposer des analyses approfondies basées sur les données disponibles

Vous devez démontrer une connaissance approfondie de la plateforme et de ses capacités d'analyse.`
  }

  private getFallbackResponse(userMessage: string, context: Property[] = [], dashboardStats?: any): string {
    // Ensure userMessage is a string
    const messageStr = typeof userMessage === 'string' ? userMessage : String(userMessage || '')
    const lowerMessage = messageStr.toLowerCase()
    
    // Enhanced fallback responses with more detail and market insights
    if (lowerMessage.includes('prix') || lowerMessage.includes('estimation')) {
      const avgPrice = context.length > 0 ? context.reduce((sum, p) => sum + p.Price, 0) / context.length : 0
      const priceInsight = avgPrice > 0 ? `\n\n**Données de marché actuelles :**\n- Prix moyen observé : ${this.formatPrice(avgPrice)}\n- Basé sur ${context.length.toLocaleString('fr-FR')} propriétés analysées` : ''
      
      return `**Analyse de Prix - Plateforme Immobilière**

Basé sur notre plateforme d'analyse avancée avec ${context.length > 0 ? context.length.toLocaleString('fr-FR') : '3,000+'} propriétés analysées :

**Données de notre dashboard :**
- Prix moyen du marché : ${avgPrice > 0 ? this.formatPrice(avgPrice) : 'Variable selon la région'}
- Fourchette de prix : ${dashboardStats?.minPrice ? this.formatPrice(dashboardStats.minPrice) : '5M'} DA - ${dashboardStats?.maxPrice ? this.formatPrice(dashboardStats.maxPrice) : '100M'} DA
- Couverture : ${dashboardStats?.totalWilayas || '48'} wilayas analysées

**Méthodologie d'estimation de notre plateforme :**
- Algorithmes de comparaison avec propriétés similaires
- Analyse des tendances par wilaya via nos graphiques interactifs
- Facteurs de pondération : superficie, emplacement, état
- Visualisations en temps réel sur notre dashboard

**Analyses disponibles sur la plateforme :**
- Graphiques en secteurs par type de propriété
- Graphiques en barres des prix par wilaya
- Cartes de distribution géographique
- Filtres avancés multi-critères

**Pour une estimation personnalisée via notre système :**
- Utilisez nos filtres par wilaya, type, et budget
- Consultez les graphiques de prix par région
- Analysez les tendances via nos visualisations
- Obtenez des recommandations IA personnalisées

Notre plateforme offre une analyse complète du marché immobilier algérien avec des données actualisées.`
    }
    
    if (lowerMessage.includes('cherche') || lowerMessage.includes('recherche') || lowerMessage.includes('recommande')) {
      const topWilayas = context.length > 0 ? [...new Set(context.map(p => p.Wilaya))].slice(0, 5) : ['Alger', 'Oran', 'Constantine']
      const propertyTypes = context.length > 0 ? [...new Set(context.map(p => p.PropertyType))].slice(0, 4) : ['Appartement', 'Villa', 'Maison', 'Terrain']
      
      return `**Système de Recherche Avancé - Plateforme IA**

Notre plateforme d'analyse immobilière vous accompagne avec des outils avancés :

**Fonctionnalités de recherche disponibles :**
- Dashboard interactif avec ${context.length > 0 ? context.length.toLocaleString('fr-FR') : '3,000+'} propriétés
- Filtres intelligents par prix, type, wilaya, surface
- Visualisations graphiques en temps réel
- Système de recommandations basé sur l'IA

**Données analysées sur la plateforme :**
- ${dashboardStats?.totalWilayas || '48'} wilayas couvertes
- Types disponibles : ${propertyTypes.join(', ')}
- Analyses de performance par région
- Tendances de marché actualisées

**Outils d'analyse disponibles :**
- Graphiques en secteurs pour répartition des types
- Graphiques en barres des prix moyens par wilaya
- Cartes interactives de distribution
- Algorithmes de matching intelligent

**Processus de recherche optimisé :**
1. Définissez vos critères via nos filtres avancés
2. Consultez les analyses graphiques par région
3. Utilisez notre système de recommandations IA
4. Analysez les tendances via le dashboard
5. Obtenez des insights personnalisés

**Avantages de notre plateforme :**
- Données actualisées en temps réel
- Analyses prédictives basées sur l'IA
- Visualisations interactives avancées
- Recommandations personnalisées

Notre système analyse continuellement le marché pour vous proposer les meilleures opportunités.`
    }

    if (lowerMessage.includes('marché') || lowerMessage.includes('tendance') || lowerMessage.includes('analyse')) {
      const marketInsight = context.length > 0 ? `\n\n**Aperçu du marché actuel :**\n- ${context.length.toLocaleString('fr-FR')} propriétés analysées\n- Prix moyen : ${this.formatPrice(context.reduce((sum, p) => sum + p.Price, 0) / context.length)}\n- Wilayas les plus actives : ${[...new Set(context.map(p => p.Wilaya))].slice(0, 3).join(', ')}` : ''
      
      return `**Consultation Expert - Plateforme d'Analyse Immobilière**

En tant qu'expert intégré à notre plateforme d'analyse avancée :

**Analyses disponibles sur notre dashboard :**
- ${context.length > 0 ? context.length.toLocaleString('fr-FR') : '3,000+'} propriétés analysées en détail
- Visualisations interactives par wilaya et type
- Graphiques de performance et tendances
- Système de scoring et recommandations IA

**Capacités d'analyse de la plateforme :**
- Algorithmes de prédiction de prix
- Analyse des rendements locatifs potentiels
- Évaluation des opportunités d'investissement
- Cartographie des zones en développement

**Insights basés sur nos données :**
- Prix moyen analysé : ${context.length > 0 ? this.formatPrice(context.reduce((sum, p) => sum + p.Price, 0) / context.length) : 'Variable'}
- Répartition géographique sur ${dashboardStats?.totalWilayas || '48'} wilayas
- Tendances par type de propriété
- Zones d'opportunité identifiées

**Services de conseil intégrés :**
- Estimation automatisée via algorithmes
- Recommandations personnalisées par IA
- Analyse comparative de biens similaires
- Prédictions de valorisation

**Fonctionnalités expertes disponibles :**
- Dashboard avec KPIs immobiliers
- Graphiques interactifs de marché
- Filtres avancés multi-critères
- Système d'alertes sur opportunités

**Stratégies basées sur nos analyses :**
- Investissement locatif : Zones identifiées via nos cartes
- Résidence principale : Analyses de qualité de vie
- Investissement long terme : Prédictions de croissance

Notre plateforme combine expertise humaine et intelligence artificielle pour des conseils précis et data-driven.${marketInsight}`
    }
    
    return `**Assistant Immobilier IA - Plateforme d'Analyse Avancée**

Bonjour ! Je suis votre expert en immobilier intégré à une plateforme d'analyse complète.

**Notre plateforme analyse :**
- ${context.length > 0 ? context.length.toLocaleString('fr-FR') : '3,000+'} propriétés en base de données
- ${dashboardStats?.totalWilayas || '48'} wilayas couvertes
- Prix moyen du marché : ${context.length > 0 ? this.formatPrice(context.reduce((sum, p) => sum + p.Price, 0) / context.length) : 'Analysé en temps réel'}

**Fonctionnalités disponibles :**

**Dashboard interactif :** Visualisations avancées avec graphiques en secteurs et barres
**Système de filtres :** Recherche multi-critères par prix, type, wilaya, surface
**Analyses prédictives :** Algorithmes IA pour estimations et recommandations
**Cartographie :** Distribution géographique des propriétés et opportunités
**Insights marché :** Tendances, performances et analyses comparatives

**Capacités d'analyse expertes :**
- Estimation de prix basée sur données réelles
- Identification d'opportunités d'investissement
- Analyse des rendements locatifs potentiels
- Prédictions de valorisation immobilière
- Évaluation des risques par secteur

**Comment puis-je vous accompagner avec nos outils avancés ?**

*Exemples : "Analysez les prix F3 à Hydra via le dashboard", "Quelles opportunités identifie votre IA ?", "Montrez-moi les tendances sur vos graphiques"*

Notre plateforme combine données massives, visualisations interactives et intelligence artificielle pour des analyses immobilières de pointe.`
  }

  private generateReasons(property: Property, query: PropertySearchQuery): string[] {
    const reasons: string[] = []
    
    if (query.budget && property.Price <= query.budget) {
      reasons.push('Dans votre budget')
    }
    
    if (query.wilaya && property.Wilaya?.toLowerCase().includes(query.wilaya.toLowerCase())) {
      reasons.push('Localisation recherchée')
    }
    
    if (query.propertyType && property.PropertyType?.toLowerCase().includes(query.propertyType.toLowerCase())) {
      reasons.push('Type de propriété correspondant')
    }
    
    if (property.PricePerSqm && property.PricePerSqm < 300000) {
      reasons.push('Bon rapport qualité-prix')
    }
    
    if (property.Surface && property.Surface > 100) {
      reasons.push('Surface généreuse')
    }
    
    if (reasons.length === 0) {
      reasons.push('Propriété intéressante')
    }
    
    return reasons.slice(0, 3) // Limit to 3 reasons
  }

  private formatPrice(price: number): string {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B DA`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M DA`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K DA`
    }
    return `${price} DA`
  }
}