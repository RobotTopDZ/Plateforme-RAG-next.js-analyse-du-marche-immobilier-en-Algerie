'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Bot, User, MapPin, DollarSign, Home as HomeIcon, Loader2, TrendingUp, BarChart3, Zap, Search, MessageCircle, Brain, Target } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { loadSalesData, loadRentalData, calculateDashboardStats } from '@/lib/data'
import { RealEstateChatbot, ChatMessage, PropertyRecommendation, ChatbotResponse, MarketAnalysis, ConversationContext } from '@/lib/chatbot-engine'
import { PropertyCard } from '@/components/PropertyCard'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "🏠 Bonjour ! Je suis Ahmed, votre conseiller immobilier personnel avec 15 ans d'expérience dans le marché algérien. J'ai accès à plus de 3,290 propriétés réelles et je peux vous accompagner dans tous vos projets immobiliers. Parlez-moi de votre projet !",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatbot, setChatbot] = useState<RealEstateChatbot | null>(null)
  const [currentResponse, setCurrentResponse] = useState<ChatbotResponse | null>(null)
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null)
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chatbot with real data
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        const [salesData, rentalData] = await Promise.all([
          loadSalesData(),
          loadRentalData()
        ])
        
        const allProperties = [...salesData, ...rentalData]
        const realEstateChatbot = new RealEstateChatbot(allProperties)
        setChatbot(realEstateChatbot)
      } catch (error) {
        console.error('Error initializing chatbot:', error)
      }
    }

    initializeChatbot()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Quick question shortcuts
  const quickQuestions = [
    "Bonjour, je cherche à acheter ma première maison",
    "Je veux investir dans l'immobilier locatif",
    "Quels sont les prix des appartements F3 à Alger ?",
    "Conseillez-moi sur le marché immobilier actuel"
  ]

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input.trim()
    if (!messageToSend || !chatbot) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Process query with advanced chatbot engine
      const response = await chatbot.processQuery(messageToSend)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        properties: response.properties,
        recommendations: response.recommendations
      }

      setMessages(prev => [...prev, aiMessage])
      setCurrentResponse(response)
      setMarketAnalysis(response.marketAnalysis || null)
      setFollowUpQuestions(response.followUpQuestions || [])
      
      // Update conversation context (we'll need to add a method to get this from chatbot)
      // For now, we'll simulate it based on the response
      if (response.properties && response.properties.length > 0) {
        const context: ConversationContext = {
          userPreferences: {
            location: response.properties[0].Wilaya,
            propertyType: response.properties[0].PropertyType,
            transactionType: response.properties[0].TransactionType as 'sale' | 'rental'
          },
          previousQueries: [messageToSend],
          userProfile: {},
          conversationStage: 'search'
        }
        setConversationContext(context)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Ahmed - Conseiller Immobilier IA
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {chatbot && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span>Données réelles chargées</span>
                </div>
              )}
              <Link href="/sales" className="text-gray-700 hover:text-blue-600 transition-colors">
                Ventes
              </Link>
              <Link href="/rental" className="text-gray-700 hover:text-blue-600 transition-colors">
                Location
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Conversation Context Sidebar */}
        {conversationContext && (
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Contexte
            </h3>
            
            <div className="space-y-4">
              {conversationContext.userPreferences.location && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-900 mb-1">Zone d'intérêt</div>
                  <div className="text-sm text-purple-700">{conversationContext.userPreferences.location}</div>
                </div>
              )}

              {conversationContext.userPreferences.propertyType && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-1">Type de bien</div>
                  <div className="text-sm text-blue-700">{conversationContext.userPreferences.propertyType}</div>
                </div>
              )}

              {conversationContext.userPreferences.budget && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-900 mb-1">Budget</div>
                  <div className="text-sm text-green-700">{formatPrice(conversationContext.userPreferences.budget)}</div>
                </div>
              )}

              {conversationContext.userPreferences.transactionType && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-orange-900 mb-1">Transaction</div>
                  <div className="text-sm text-orange-700">
                    {conversationContext.userPreferences.transactionType === 'sale' ? 'Achat' : 'Location'}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Étape</div>
                <div className="text-sm text-gray-700 capitalize">{conversationContext.conversationStage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-6 bg-white border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Commencez la conversation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {followUpQuestions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Questions pour mieux vous conseiller
              </h4>
              <div className="flex flex-wrap gap-2">
                {followUpQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-xs px-3 py-2 bg-white hover:bg-blue-50 rounded-full text-blue-700 border border-blue-200 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-4xl px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-xs text-center mt-1 text-gray-500">Ahmed</div>
                      </div>
                    )}
                    {message.role === 'user' && (
                      <User className="h-6 w-6 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      
                      {/* Property Cards for Assistant Messages */}
                      {message.role === 'assistant' && message.properties && message.properties.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <HomeIcon className="h-4 w-4 mr-2" />
                            Propriétés sélectionnées ({message.properties.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {message.properties.slice(0, 4).map((property, index) => (
                              <PropertyCard
                                key={`${property.ID || index}`}
                                property={property}
                                recommendation={message.recommendations?.find(r => r.property.ID === property.ID)}
                                showRecommendationScore={true}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 shadow-md max-w-xs px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm">Ahmed réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Discutez avec Ahmed de votre projet immobilier..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || !chatbot}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim() || !chatbot}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Market Analysis Sidebar */}
        {marketAnalysis && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Analyse du Marché
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Prix Moyen</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(marketAnalysis.averagePrice)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Fourchette de Prix</div>
                <div className="text-sm text-gray-900">
                  {formatPrice(marketAnalysis.priceRange.min)} - {formatPrice(marketAnalysis.priceRange.max)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Tendance</div>
                <div className={`text-sm font-medium ${
                  marketAnalysis.marketTrend === 'rising' ? 'text-green-600' :
                  marketAnalysis.marketTrend === 'declining' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {marketAnalysis.marketTrend === 'rising' ? '📈 En hausse' :
                   marketAnalysis.marketTrend === 'declining' ? '📉 En baisse' : '📊 Stable'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Niveau de Demande</div>
                <div className={`text-sm font-medium ${
                  marketAnalysis.demandLevel === 'high' ? 'text-red-600' :
                  marketAnalysis.demandLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {marketAnalysis.demandLevel === 'high' ? '🔥 Élevé' :
                   marketAnalysis.demandLevel === 'medium' ? '⚡ Modéré' : '✅ Faible'}
                </div>
              </div>

              {marketAnalysis.insights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Insights d'Ahmed</h4>
                  <ul className="space-y-2">
                    {marketAnalysis.insights.map((insight, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}