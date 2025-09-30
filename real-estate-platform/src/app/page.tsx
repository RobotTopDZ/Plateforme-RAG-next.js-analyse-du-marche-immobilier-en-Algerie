import Link from "next/link";
import { Building2, Home, MessageSquare, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Plateforme Immobilière
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/sales" className="text-gray-700 hover:text-blue-600 transition-colors">
                Vente
              </Link>
              <Link href="/rental" className="text-gray-700 hover:text-blue-600 transition-colors">
                Location
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors">
                Assistant IA
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Analysez le Marché
            <span className="text-blue-600"> Immobilier</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les tendances du marché immobilier algérien avec nos tableaux de bord 
            avancés et notre assistant IA pour vous aider à trouver la propriété parfaite.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sales Dashboard */}
          <Link href="/sales" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tableau de Bord Vente
              </h3>
              <p className="text-gray-600 mb-4">
                Analysez les données de vente immobilière avec des visualisations 
                avancées et des statistiques détaillées.
              </p>
              <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                Explorer les ventes →
              </div>
            </div>
          </Link>

          {/* Rental Dashboard */}
          <Link href="/rental" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tableau de Bord Location
              </h3>
              <p className="text-gray-600 mb-4">
                Découvrez les tendances du marché locatif avec des analyses 
                approfondies et des insights précieux.
              </p>
              <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                Explorer les locations →
              </div>
            </div>
          </Link>

          {/* AI Assistant */}
          <Link href="/chat" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Assistant IA
              </h3>
              <p className="text-gray-600 mb-4">
                Obtenez des recommandations personnalisées et des estimations 
                de prix grâce à notre assistant IA avancé.
              </p>
              <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                Commencer la conversation →
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Données du Marché
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">3,291</div>
              <div className="text-gray-600">Propriétés Analysées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">1,634</div>
              <div className="text-gray-600">Annonces de Vente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">1,657</div>
              <div className="text-gray-600">Annonces de Location</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              Developed by KHALDI Oussama 2025 - Analyse avancée du marché immobilier algérien.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
