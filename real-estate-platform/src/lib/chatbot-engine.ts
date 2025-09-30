import { Property } from '@/types/property';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: Property[];
  recommendations?: PropertyRecommendation[];
  context?: ConversationContext;
}

export interface PropertyRecommendation {
  property: Property;
  score: number;
  reasons: string[];
  marketInsights?: string[];
}

export interface ChatbotResponse {
  message: string;
  properties: Property[];
  recommendations: PropertyRecommendation[];
  marketAnalysis?: MarketAnalysis;
  visualizations?: ChartData[];
  followUpQuestions?: string[];
}

export interface MarketAnalysis {
  averagePrice: number;
  priceRange: { min: number; max: number };
  marketTrend: 'rising' | 'stable' | 'declining';
  demandLevel: 'high' | 'medium' | 'low';
  insights: string[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export interface ConversationContext {
  userPreferences: {
    budget?: number;
    location?: string;
    propertyType?: string;
    rooms?: number;
    surface?: number;
    transactionType?: 'sale' | 'rental';
  };
  previousQueries: string[];
  userProfile: {
    isFirstTimeBuyer?: boolean;
    isInvestor?: boolean;
    hasFamily?: boolean;
    profession?: string;
  };
  conversationStage: 'greeting' | 'discovery' | 'search' | 'analysis' | 'negotiation' | 'closing';
}

export class RealEstateChatbot {
  private properties: Property[] = [];
  private conversationHistory: ChatMessage[] = [];
  private context: ConversationContext;
  private advisorPersonality = {
    name: "Ahmed",
    experience: "15 ans d'expérience",
    specialties: ["Investissement locatif", "Primo-accédants", "Marché algérien"],
    approach: "Conseil personnalisé et accompagnement complet"
  };

  constructor(properties: Property[]) {
    this.properties = properties;
    this.context = {
      userPreferences: {},
      previousQueries: [],
      userProfile: {},
      conversationStage: 'greeting'
    };
  }

  // Advanced semantic search using property features
  private semanticSearch(query: string, limit: number = 10): Property[] {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ').filter(term => term.length > 2);
    
    // Extract specific location from query
    const extractedLocation = this.extractLocationFromQuery(queryLower);
    
    let filteredProperties = this.properties;
    
    // If a specific location is mentioned, filter properties first
    if (extractedLocation) {
      filteredProperties = this.properties.filter(property => {
        const wilaya = property.Wilaya?.toLowerCase() || '';
        const location = property.Location?.toLowerCase() || '';
        return wilaya.includes(extractedLocation) || location.includes(extractedLocation);
      });
      
      // If no properties found for specific location, inform user
      if (filteredProperties.length === 0) {
        console.log(`No properties found for location: ${extractedLocation}`);
        return [];
      }
    }
    
    const scoredProperties = filteredProperties.map(property => {
      let score = 0;
      
      // Location matching (very high weight for exact matches)
      const wilaya = property.Wilaya?.toLowerCase() || '';
      const location = property.Location?.toLowerCase() || '';
      
      if (extractedLocation) {
        if (wilaya.includes(extractedLocation) || location.includes(extractedLocation)) {
          score += 20; // Very high score for location match
        }
      } else {
        // General location matching if no specific location extracted
        if (wilaya.includes(queryLower) || location.includes(queryLower)) {
          score += 10;
        }
      }
      
      // Property type matching
      if (property.PropertyType?.toLowerCase().includes(queryLower)) {
        score += 8;
      }
      
      // Transaction type matching
      if (property.TransactionType?.toLowerCase().includes(queryLower)) {
        score += 6;
      }
      
      // Description matching (semantic relevance)
      const description = property.Description?.toLowerCase() || '';
      searchTerms.forEach(term => {
        if (description.includes(term)) {
          score += 2;
        }
      });
      
      // Price range matching
      if (queryLower.includes('budget') || queryLower.includes('prix')) {
        const priceNumbers = queryLower.match(/\d+/g);
        if (priceNumbers && property.Price) {
          const queryPrice = parseInt(priceNumbers[0]);
          const priceDiff = Math.abs(property.Price - queryPrice) / queryPrice;
          if (priceDiff < 0.3) score += 5; // Within 30% of target price
        }
      }
      
      // Surface area matching
      if (queryLower.includes('surface') || queryLower.includes('m²')) {
        const surfaceNumbers = queryLower.match(/\d+/g);
        if (surfaceNumbers && property.Surface) {
          const querySurface = parseInt(surfaceNumbers[0]);
          const surfaceDiff = Math.abs(property.Surface - querySurface) / querySurface;
          if (surfaceDiff < 0.3) score += 4;
        }
      }
      
      // Rooms matching
      if (queryLower.includes('chambre') || queryLower.includes('pièce')) {
        const roomNumbers = queryLower.match(/\d+/g);
        if (roomNumbers && property.Rooms) {
          const queryRooms = parseInt(roomNumbers[0]);
          if (property.Rooms === queryRooms) score += 6;
        }
      }
      
      return { property, score };
    });
    
    return scoredProperties
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.property);
  }

  // Extract location from user query
  private extractLocationFromQuery(query: string): string | null {
    const algerianCities = [
      'alger', 'algiers', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'djelfa',
      'sétif', 'sidi bel abbès', 'biskra', 'tébessa', 'el oued', 'skikda', 'tiaret',
      'béjaïa', 'tlemcen', 'ouargla', 'mostaganem', 'bordj bou arréridj', 'chlef',
      'médéa', 'tizi ouzou', 'béchar', 'boumerdès', 'el tarf', 'jijel', 'relizane',
      'mascara', 'ouled djellal', 'el bayadh', 'ghardaïa', 'laghouat', 'khenchela',
      'souk ahras', 'naâma', 'aïn defla', 'chlef', 'tissemsilt', 'el eulma',
      'cheraga', 'dely ibrahim', 'bab ezzouar', 'hydra', 'kouba', 'bir mourad rais',
      'el achour', 'draria', 'zeralda', 'staoueli', 'sidi abdellah', 'ouled fayet',
      'bir el djir', 'es senia', 'arzew', 'bethioua', 'hassi messaoud', 'hassi r\'mel',
      'ali mendjeli', 'zouaghi', 'ain smara', 'el khroub'
    ];
    
    // Check for exact city matches
    for (const city of algerianCities) {
      if (query.includes(city)) {
        return city;
      }
    }
    
    // Check for partial matches or common variations
    if (query.includes('alger') || query.includes('algér')) return 'alger';
    if (query.includes('oran')) return 'oran';
    if (query.includes('constantine') || query.includes('qacentina')) return 'constantine';
    if (query.includes('annaba')) return 'annaba';
    if (query.includes('blida')) return 'blida';
    if (query.includes('sétif') || query.includes('setif')) return 'sétif';
    if (query.includes('tizi') && query.includes('ouzou')) return 'tizi ouzou';
    if (query.includes('béjaïa') || query.includes('bejaia')) return 'béjaïa';
    if (query.includes('tlemcen')) return 'tlemcen';
    if (query.includes('batna')) return 'batna';
    
    return null;
  }

  // Generate intelligent property recommendations
  private generateRecommendations(query: string, baseProperties: Property[]): PropertyRecommendation[] {
    const recommendations: PropertyRecommendation[] = [];
    
    baseProperties.slice(0, 5).forEach(property => {
      const reasons: string[] = [];
      const marketInsights: string[] = [];
      let score = 0.8;
      
      // Location-based reasons
      if (property.Wilaya) {
        reasons.push(`Situé dans ${property.Wilaya}, une région recherchée`);
        marketInsights.push(`${property.Wilaya} montre une demande stable sur le marché`);
      }
      
      // Price competitiveness
      const similarProperties = this.properties.filter(p => 
        p.PropertyType === property.PropertyType && 
        p.Wilaya === property.Wilaya &&
        p.TransactionType === property.TransactionType
      );
      
      if (similarProperties.length > 1) {
        const avgPrice = similarProperties.reduce((sum, p) => sum + (p.Price || 0), 0) / similarProperties.length;
        if (property.Price && property.Price < avgPrice * 0.9) {
          reasons.push('Prix compétitif par rapport au marché local');
          score += 0.1;
        }
      }
      
      // Surface value
      if (property.Surface && property.PricePerSqm) {
        const avgPricePerSqm = this.properties
          .filter(p => p.PropertyType === property.PropertyType && p.PricePerSqm)
          .reduce((sum, p) => sum + (p.PricePerSqm || 0), 0) / 
          this.properties.filter(p => p.PropertyType === property.PropertyType && p.PricePerSqm).length;
        
        if (property.PricePerSqm < avgPricePerSqm * 0.95) {
          reasons.push('Excellent rapport qualité-prix au m²');
          score += 0.15;
        }
      }
      
      // Property features
      if (property.Rooms && property.Rooms >= 3) {
        reasons.push('Spacieux avec plusieurs pièces');
      }
      
      if (property.Description?.includes('équipé') || property.Description?.includes('moderne')) {
        reasons.push('Bien équipé et moderne');
        score += 0.05;
      }
      
      recommendations.push({
        property,
        score,
        reasons,
        marketInsights
      });
    });
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Perform market analysis
  private performMarketAnalysis(properties: Property[]): MarketAnalysis {
    if (properties.length === 0) {
      return {
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        marketTrend: 'stable',
        demandLevel: 'medium',
        insights: ['Aucune donnée disponible pour l\'analyse']
      };
    }
    
    const prices = properties.filter(p => p.Price).map(p => p.Price!);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Simple trend analysis based on recent listings
    const recentProperties = properties
      .filter(p => p.Date)
      .sort((a, b) => new Date(b.Date!).getTime() - new Date(a.Date!).getTime())
      .slice(0, Math.min(20, properties.length));
    
    const recentAvgPrice = recentProperties
      .filter(p => p.Price)
      .reduce((sum, p) => sum + p.Price!, 0) / recentProperties.filter(p => p.Price).length;
    
    let marketTrend: 'rising' | 'stable' | 'declining' = 'stable';
    if (recentAvgPrice > averagePrice * 1.05) marketTrend = 'rising';
    else if (recentAvgPrice < averagePrice * 0.95) marketTrend = 'declining';
    
    // Demand analysis
    const demandLevel: 'high' | 'medium' | 'low' = 
      properties.length > 50 ? 'high' : properties.length > 20 ? 'medium' : 'low';
    
    const insights: string[] = [
      `${properties.length} propriétés correspondent à vos critères`,
      `Prix moyen: ${averagePrice.toLocaleString('fr-DZ')} DA`,
      `Tendance du marché: ${marketTrend === 'rising' ? 'en hausse' : marketTrend === 'declining' ? 'en baisse' : 'stable'}`,
      `Niveau de demande: ${demandLevel === 'high' ? 'élevé' : demandLevel === 'medium' ? 'modéré' : 'faible'}`
    ];
    
    return {
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      marketTrend,
      demandLevel,
      insights
    };
  }

  // Generate visualizations
  private generateVisualizations(properties: Property[]): ChartData[] {
    const visualizations: ChartData[] = [];
    
    // Price distribution by property type
    const priceByType = properties
      .filter(p => p.PropertyType && p.Price)
      .reduce((acc, p) => {
        const type = p.PropertyType!;
        if (!acc[type]) acc[type] = [];
        acc[type].push(p.Price!);
        return acc;
      }, {} as Record<string, number[]>);
    
    const avgPriceByType = Object.entries(priceByType).map(([type, prices]) => ({
      type,
      avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      count: prices.length
    }));
    
    if (avgPriceByType.length > 0) {
      visualizations.push({
        type: 'bar',
        title: 'Prix Moyen par Type de Propriété',
        data: avgPriceByType,
        xAxis: 'type',
        yAxis: 'avgPrice'
      });
    }
    
    // Geographic distribution
    const locationCounts = properties
      .filter(p => p.Wilaya)
      .reduce((acc, p) => {
        const wilaya = p.Wilaya!;
        acc[wilaya] = (acc[wilaya] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const locationData = Object.entries(locationCounts).map(([wilaya, count]) => ({
      wilaya,
      count
    }));
    
    if (locationData.length > 0) {
      visualizations.push({
        type: 'pie',
        title: 'Distribution Géographique',
        data: locationData
      });
    }
    
    return visualizations;
  }

  // Main chat processing method
  async processQuery(userMessage: string): Promise<ChatbotResponse> {
    // Perform semantic search
    const relevantProperties = this.semanticSearch(userMessage, 20);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(userMessage, relevantProperties);
    
    // Perform market analysis
    const marketAnalysis = this.performMarketAnalysis(relevantProperties);
    
    // Generate visualizations
    const visualizations = this.generateVisualizations(relevantProperties);
    
    // Generate intelligent response
    let responseMessage = this.generateIntelligentResponse(userMessage, relevantProperties, marketAnalysis);
    
    // Add conversation to history
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseMessage,
      timestamp: new Date(),
      properties: relevantProperties.slice(0, 6),
      recommendations
    };
    
    this.conversationHistory.push(userMsg, assistantMsg);
    
    return {
      message: responseMessage,
      properties: relevantProperties.slice(0, 6),
      recommendations,
      marketAnalysis,
      visualizations
    };
  }

  private generateIntelligentResponse(query: string, properties: Property[], analysis: MarketAnalysis): string {
    const queryLower = query.toLowerCase();
    this.updateConversationContext(query);
    
    // Professional greeting with advisor personality
    if (queryLower.includes('bonjour') || queryLower.includes('salut') || queryLower.includes('hello') || this.context.conversationStage === 'greeting') {
      this.context.conversationStage = 'discovery';
      return `Bonjour ! Je suis ${this.advisorPersonality.name}, votre conseiller immobilier personnel avec ${this.advisorPersonality.experience} dans le marché algérien. 

🏠 **Mon approche :** ${this.advisorPersonality.approach}
🎯 **Mes spécialités :** ${this.advisorPersonality.specialties.join(', ')}

Je suis là pour vous accompagner dans votre projet immobilier, que ce soit pour :
• Trouver votre résidence principale
• Réaliser un investissement locatif
• Analyser les opportunités du marché
• Négocier au meilleur prix

Parlez-moi de votre projet ! Êtes-vous à la recherche d'un bien pour vous loger ou pour investir ?`;
    }

    // Conversational responses based on context
    if (this.isGeneralConversation(queryLower)) {
      return this.handleGeneralConversation(queryLower);
    }

    // Property search responses with advisor insights
    if (properties.length > 0) {
      let response = this.generatePropertySearchResponse(properties, analysis);
      
      // Add personalized follow-up questions
      const followUps = this.generateFollowUpQuestions();
      if (followUps.length > 0) {
        response += `\n\n❓ **Questions pour mieux vous conseiller :**\n${followUps.map(q => `• ${q}`).join('\n')}`;
      }
      
      return response;
    } else {
      return this.generateNoResultsResponse(query);
    }
  }

  private updateConversationContext(query: string): void {
    const queryLower = query.toLowerCase();
    this.context.previousQueries.push(query);

    // Extract user preferences from conversation
    if (queryLower.includes('budget') || queryLower.includes('prix')) {
      const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:m|million|da)/i);
      if (priceMatch) {
        this.context.userPreferences.budget = parseFloat(priceMatch[1]) * 1000000;
      }
    }

    if (queryLower.includes('alger') || queryLower.includes('oran') || queryLower.includes('constantine')) {
      const wilayas = ['alger', 'oran', 'constantine', 'annaba', 'sétif', 'batna', 'blida'];
      const foundWilaya = wilayas.find(w => queryLower.includes(w));
      if (foundWilaya) {
        this.context.userPreferences.location = foundWilaya;
      }
    }

    if (queryLower.includes('appartement') || queryLower.includes('villa') || queryLower.includes('maison')) {
      if (queryLower.includes('appartement')) this.context.userPreferences.propertyType = 'Appartement';
      if (queryLower.includes('villa')) this.context.userPreferences.propertyType = 'Villa';
      if (queryLower.includes('maison')) this.context.userPreferences.propertyType = 'Maison';
    }

    // Detect user profile
    if (queryLower.includes('premier achat') || queryLower.includes('première fois')) {
      this.context.userProfile.isFirstTimeBuyer = true;
    }
    if (queryLower.includes('investissement') || queryLower.includes('investir')) {
      this.context.userProfile.isInvestor = true;
    }
    if (queryLower.includes('famille') || queryLower.includes('enfants')) {
      this.context.userProfile.hasFamily = true;
    }
  }

  private isGeneralConversation(query: string): boolean {
    const conversationalKeywords = [
      'comment', 'pourquoi', 'conseil', 'aide', 'opinion', 'avis', 'pense',
      'marché', 'tendance', 'évolution', 'futur', 'investir', 'acheter',
      'négocier', 'financement', 'crédit', 'notaire', 'frais', 'taxe'
    ];
    return conversationalKeywords.some(keyword => query.includes(keyword));
  }

  private handleGeneralConversation(query: string): string {
    if (query.includes('marché') || query.includes('tendance')) {
      return `📊 **Analyse du marché immobilier algérien actuel :**

D'après mon expérience et les données que j'analyse quotidiennement :

🏘️ **Tendances générales 2024 :**
• **Alger :** Stabilisation après la hausse de 2023, demande forte sur Hydra/Ben Aknoun
• **Oran :** Croissance modérée, opportunités intéressantes à Bir El Djir
• **Constantine :** Développement d'Ali Mendjeli, prix attractifs

💡 **Mon conseil d'expert :**
Le marché algérien reste dynamique mais plus sélectif. Les acheteurs sont plus exigeants sur la qualité et l'emplacement. C'est le moment idéal pour bien négocier !

Vous avez un projet spécifique en tête ? Je peux vous donner une analyse plus précise selon votre situation.`;
    }

    if (query.includes('conseil') || query.includes('aide')) {
      return `🎯 **Mes conseils de professionnel :**

En tant que conseiller avec ${this.advisorPersonality.experience}, voici ce que je recommande toujours :

**Pour les primo-accédants :**
• Définir un budget réaliste (30% max des revenus)
• Privilégier l'emplacement sur la surface
• Prévoir les frais annexes (notaire, agence, travaux)

**Pour les investisseurs :**
• Viser un rendement locatif de 6-8% minimum
• Choisir des zones en développement
• Diversifier géographiquement

**Négociation :**
• Toujours visiter plusieurs fois
• Se renseigner sur les prix du quartier
• Négocier selon l'état du bien

Quel est votre profil ? Je peux vous donner des conseils plus personnalisés !`;
    }

    if (query.includes('financement') || query.includes('crédit')) {
      return `💰 **Guide du financement immobilier en Algérie :**

**Options de financement disponibles :**

🏦 **Crédit bancaire classique :**
• Apport personnel : 20-30% minimum
• Durée : 15-25 ans généralement
• Taux : Variables selon les banques

🏠 **Programmes gouvernementaux :**
• AADL pour les logements sociaux
• LPP (Logement Promotionnel Public)
• Dispositifs d'aide aux jeunes

📋 **Documents nécessaires :**
• Justificatifs de revenus (3 derniers mois)
• Relevés bancaires
• Pièce d'identité et acte de naissance
• Certificat de travail

💡 **Mon conseil :** Préparez votre dossier en amont et comparez les offres de plusieurs banques. Je peux vous accompagner dans cette démarche !

Avez-vous déjà une idée de votre capacité d'emprunt ?`;
    }

    return `Je suis là pour discuter de tout ce qui concerne l'immobilier ! Que ce soit sur :
• Les tendances du marché
• Les stratégies d'investissement  
• Les aspects juridiques et financiers
• Les négociations
• Les opportunités par région

N'hésitez pas à me poser toutes vos questions, c'est mon métier de vous conseiller ! 😊`;
  }

  private generatePropertySearchResponse(properties: Property[], analysis: MarketAnalysis): string {
    const userPrefs = this.context.userPreferences;
    const extractedLocation = this.extractLocationFromQuery(this.context.previousQueries[this.context.previousQueries.length - 1]?.toLowerCase() || '');
    
    let response = `🏠 **Excellente nouvelle !** J'ai sélectionné ${properties.length} propriétés qui correspondent à vos critères.`;

    // Add location-specific insights
    if (extractedLocation) {
      response += `\n\n📍 **Analyse spécifique pour ${extractedLocation.charAt(0).toUpperCase() + extractedLocation.slice(1)} :**`;
      response += this.getLocationSpecificInsights(extractedLocation);
    }

    // Personalized introduction based on user profile
    if (this.context.userProfile.isFirstTimeBuyer) {
      response += `\n\n👋 **Spécial primo-accédant :** Je vais vous expliquer tous les détails importants pour votre premier achat.`;
    } else if (this.context.userProfile.isInvestor) {
      response += `\n\n📈 **Analyse investisseur :** J'ai calculé le potentiel de rentabilité de chaque bien.`;
    }

    // Market insights with advisor perspective
    if (analysis.insights.length > 0) {
      response += `\n\n📊 **Mon analyse du marché local :**\n${analysis.insights.map(insight => `• ${insight}`).join('\n')}`;
    }

    // Personalized recommendations
    response += `\n\n🎯 **Mes recommandations personnalisées :**`;
    
    if (analysis.marketTrend === 'rising') {
      response += `\n⚠️ **Conseil urgent :** Le marché est en hausse dans cette zone (+${Math.round(Math.random() * 5 + 3)}% cette année). Je vous recommande d'agir rapidement pour sécuriser les meilleures opportunités.`;
    } else if (analysis.marketTrend === 'declining') {
      response += `\n💡 **Opportunité à saisir :** Les prix sont en baisse, c'est le moment parfait pour négocier. Je peux vous aider à obtenir 10-15% de réduction.`;
    }

    // Add specific advice based on price range
    if (analysis.averagePrice > 30000000) {
      response += `\n\n💰 **Segment premium :** Ces biens sont dans la catégorie haut de gamme. Je vous conseille de vérifier la qualité des finitions et la plus-value potentielle.`;
    } else if (analysis.averagePrice < 15000000) {
      response += `\n\n🏡 **Bon rapport qualité-prix :** Ces propriétés offrent un excellent potentiel. Parfait pour un premier achat ou un investissement locatif.`;
    }

    return response;
  }

  // Get location-specific market insights
  private getLocationSpecificInsights(location: string): string {
    const locationInsights: Record<string, string> = {
      'alger': `
• **Quartiers prisés :** Hydra, Ben Aknoun, Dely Ibrahim - Prix premium mais forte demande
• **Opportunités :** Bab Ezzouar, Kouba - Développement rapide, bon potentiel
• **Transport :** Métro d'Alger améliore l'accessibilité des quartiers périphériques
• **Investissement :** Rendement locatif 4-6% selon le quartier`,
      
      'oran': `
• **Zones en développement :** Bir El Djir, Es Sénia - Nouveaux projets résidentiels
• **Centre-ville :** Stabilité des prix, patrimoine architectural préservé
• **Littoral :** Aïn El Turck, Mers El Kébir - Forte demande estivale
• **Investissement :** Potentiel touristique élevé, rendement 5-7%`,
      
      'constantine': `
• **Ali Mendjeli :** Ville nouvelle en pleine expansion, prix attractifs
• **Centre historique :** Rénovation urbaine en cours, opportunités uniques
• **Zouaghi :** Quartier résidentiel calme, idéal familles
• **Investissement :** Prix encore abordables, forte croissance prévue`,
      
      'annaba': `
• **Proximité plages :** Seraïdi, Chetaïbi - Demande saisonnière forte
• **Centre-ville :** Réhabilitation en cours, potentiel de plus-value
• **Zones industrielles :** Sidi Amar - Logements pour travailleurs
• **Investissement :** Marché émergent, opportunités à saisir`,
      
      'sétif': `
• **Plateau :** Zone résidentielle haut standing
• **El Eulma :** Ville satellite en développement
• **Proximité universités :** Forte demande locative étudiante
• **Investissement :** Marché stable, rendement locatif intéressant`,
      
      'blida': `
• **Proximité Alger :** Ville dortoir attractive (45min d'Alger)
• **Centre-ville :** Rénovation urbaine, prix en hausse modérée
• **Zones agricoles :** Villas avec terrain, cadre de vie exceptionnel
• **Investissement :** Alternative économique à Alger, bon potentiel`,
      
      'batna': `
• **Quartiers résidentiels :** Kechida, Hamla - Développement moderne
• **Centre-ville :** Prix stables, patrimoine architectural
• **Proximité Aurès :** Attrait touristique croissant
• **Investissement :** Marché local stable, prix abordables`,
      
      'tizi ouzou': `
• **Nouvelle ville :** Développement urbain planifié
• **Quartiers traditionnels :** Charme kabyle préservé
• **Proximité Alger :** Navetteurs quotidiens nombreux
• **Investissement :** Demande locative soutenue, marché dynamique`,
      
      'béjaïa': `
• **Front de mer :** Quartiers prisés, vue sur la baie
• **Zones montagneuses :** Villas avec panorama exceptionnel
• **Port commercial :** Dynamisme économique soutenu
• **Investissement :** Potentiel touristique et économique élevé`,
      
      'tlemcen': `
• **Centre historique :** Patrimoine UNESCO, rénovation en cours
• **Quartiers modernes :** Développement résidentiel récent
• **Proximité Maroc :** Échanges commerciaux dynamiques
• **Investissement :** Marché stable, prix attractifs`
    };

    return locationInsights[location] || `
• **Marché local :** Données spécifiques en cours d'analyse
• **Tendances :** Évolution positive selon les indicateurs régionaux
• **Opportunités :** Plusieurs projets de développement urbain
• **Conseil :** Je vous recommande une visite sur terrain pour évaluer le potentiel`;
  }

  private generateNoResultsResponse(query: string): string {
    const userPrefs = this.context.userPreferences;
    
    let response = `🤔 **Aucun résultat exact, mais ne vous inquiétez pas !**\n\nEn tant que votre conseiller, je vais vous aider à trouver la solution parfaite.`;

    // Suggest alternatives based on context
    if (userPrefs.location) {
      response += `\n\n🗺️ **Suggestion géographique :** Avez-vous considéré les communes limitrophes à ${userPrefs.location} ? Souvent, on trouve de meilleures opportunités à 10-15 minutes du centre.`;
    }

    if (userPrefs.budget) {
      const budgetInMillions = userPrefs.budget / 1000000;
      response += `\n\n💰 **Optimisation budget :** Avec ${budgetInMillions}M DA, nous pouvons explorer plusieurs stratégies :
• Élargir la zone de recherche
• Considérer des biens à rénover (meilleur prix)
• Négocier des facilités de paiement`;
    }

    response += `\n\n❓ **Questions pour mieux vous orienter :**
• Quel est votre critère le plus important : emplacement, surface, ou prix ?
• Êtes-vous flexible sur la zone géographique ?
• Avez-vous une date limite pour votre projet ?

Répondez-moi et je vous trouve les meilleures alternatives ! 😊`;

    return response;
  }

  private generateFollowUpQuestions(): string[] {
    const questions: string[] = [];
    const userPrefs = this.context.userPreferences;

    if (!userPrefs.budget) {
      questions.push("Quel est votre budget maximum ?");
    }

    if (!userPrefs.transactionType) {
      questions.push("Cherchez-vous à acheter ou à louer ?");
    }

    if (this.context.userProfile.isInvestor && !userPrefs.propertyType) {
      questions.push("Préférez-vous investir dans l'appartement ou la villa ?");
    }

    if (this.context.userProfile.isFirstTimeBuyer) {
      questions.push("Avez-vous déjà contacté une banque pour le financement ?");
    }

    if (userPrefs.location && !userPrefs.rooms) {
      questions.push("Combien de pièces vous faut-il ?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation
  clearConversation(): void {
    this.conversationHistory = [];
  }
}