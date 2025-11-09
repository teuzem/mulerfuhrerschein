import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Euro, Car, Bike, Truck, Bus, Search, FileText, Camera, LocationEdit as Edit, Mail, CreditCard, Award, UserPlus, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { supabase, LicenseType } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SEOHead from '../components/seo/SEOHead'
import { pageSEO } from '../lib/seoData'
import toast from 'react-hot-toast'

// Données de fallback en cas de problème Supabase
const fallbackLicenseTypes: LicenseType[] = [
  {
    id: '1',
    category: 'AM',
    name_de: 'Moped-Führerschein',
    name_en: 'Moped License',
    description_de: 'Mopeds bis 50 ccm und max. 45 km/h',
    price_net_euros: 421,
    price_gross_euros: 501,
    vat_rate: 19.0,
    processing_days: 7,
    requires_theory_test: true,
    minimum_age: 16,
    is_active: true,
    image_url: '/images/moped-license.jpg'
  },
  {
    id: '2',
    category: 'A1',
    name_de: 'Leichtkraftrad-Führerschein',
    name_en: 'Light Motorcycle License',
    description_de: 'Motorräder bis 125 ccm und max. 11 kW',
    price_net_euros: 421,
    price_gross_euros: 501,
    vat_rate: 19.0,
    processing_days: 10,
    requires_theory_test: true,
    minimum_age: 16,
    is_active: true,
    image_url: '/images/motorcycle-a1.jpg'
  },
  {
    id: '3',
    category: 'A2',
    name_de: 'Kraftrad-Führerschein',
    name_en: 'Restricted Motorcycle License',
    description_de: 'Motorräder bis 35 kW Leistung',
    price_net_euros: 421,
    price_gross_euros: 501,
    vat_rate: 19.0,
    processing_days: 14,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: '/images/motorcycle-a2.jpg'
  },
  {
    id: '4',
    category: 'A',
    name_de: 'Motorrad-Führerschein',
    name_en: 'Full Motorcycle License',
    description_de: 'Alle Motorräder ohne Leistungsbeschränkung',
    price_net_euros: 421,
    price_gross_euros: 501,
    vat_rate: 19.0,
    processing_days: 21,
    requires_theory_test: true,
    minimum_age: 20,
    is_active: true,
    image_url: '/images/motorcycle-full.jpg'
  },
  {
    id: '5',
    category: 'B',
    name_de: 'PKW-Führerschein',
    name_en: 'Car License',
    description_de: 'PKW bis 3,5 t und max. 8 Sitze',
    price_net_euros: 1269,
    price_gross_euros: 1510,
    vat_rate: 19.0,
    processing_days: 14,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: '/images/car-license.jpg'
  },
  {
    id: '6',
    category: 'BE',
    name_de: 'PKW mit Anhänger',
    name_en: 'Car with Trailer License',
    description_de: 'PKW mit Anhänger über 750 kg',
    price_net_euros: 263,
    price_gross_euros: 313,
    vat_rate: 19.0,
    processing_days: 7,
    requires_theory_test: false,
    minimum_age: 18,
    is_active: true,
    image_url: '/images/car-trailer.jpg'
  },
  {
    id: '7',
    category: 'C1',
    name_de: 'Klein-LKW-Führerschein',
    name_en: 'Light Truck License',
    description_de: 'LKW von 3,5 t bis 7,5 t',
    price_net_euros: 2101,
    price_gross_euros: 2500,
    vat_rate: 19.0,
    processing_days: 21,
    requires_theory_test: true,
    minimum_age: 18,
    is_active: true,
    image_url: '/images/truck-license.jpg'
  },
  {
    id: '8',
    category: 'C',
    name_de: 'LKW-Führerschein',
    name_en: 'Heavy Truck License',
    description_de: 'LKW über 3,5 t',
    price_net_euros: 2521,
    price_gross_euros: 3000,
    vat_rate: 19.0,
    processing_days: 28,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: '/images/truck-license.jpg'
  },
  {
    id: '9',
    category: 'CE',
    name_de: 'LKW mit Anhänger',
    name_en: 'Truck with Trailer License',
    description_de: 'LKW über 3,5 t mit Anhänger',
    price_net_euros: 2941,
    price_gross_euros: 3500,
    vat_rate: 19.0,
    processing_days: 35,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: '/images/truck-trailer.jpg'
  },
  {
    id: '10',
    category: 'D1',
    name_de: 'Kleinbus-Führerschein',
    name_en: 'Minibus License',
    description_de: 'Bus mit 9-16 Sitzen',
    price_net_euros: 3151,
    price_gross_euros: 3750,
    vat_rate: 19.0,
    processing_days: 35,
    requires_theory_test: true,
    minimum_age: 21,
    is_active: true,
    image_url: '/images/bus-license.jpg'
  },
  {
    id: '11',
    category: 'D',
    name_de: 'Bus-Führerschein',
    name_en: 'Bus License',
    description_de: 'Bus über 8 Sitze',
    price_net_euros: 3571,
    price_gross_euros: 4250,
    vat_rate: 19.0,
    processing_days: 42,
    requires_theory_test: true,
    minimum_age: 24,
    is_active: true,
    image_url: '/images/bus-license.jpg'
  }
]

interface AdditionalService {
  id: string;
  name_de: string;
  description_de: string;
  price_euros: number;
  processing_days: number;
  category: string;
  icon: any;
  image: string;
  color: string;
}

export default function Services() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<LicenseType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  const [additionalServices] = useState<AdditionalService[]>([
    {
      id: 'uber-eats-account-creation',
      name_de: 'Uber Eats Konto erstellen',
      description_de: 'Professionelle Erstellung Ihres Uber Eats Fahrerkontos mit allen erforderlichen Dokumenten und Verifizierungen.',
      price_euros: 299,
      processing_days: 3,
      category: 'UBER_EATS',
      icon: UserPlus,
      image: 'https://owvwqdcgtpngbtfdkhwt.supabase.co/storage/v1/object/public/license-images/uber_eats_create',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'uber-eats-account-activation',
      name_de: 'Uber Eats Konto aktivieren',
      description_de: 'Schnelle Aktivierung Ihres bestehenden Uber Eats Kontos durch unsere Experten für sofortigen Einsatz.',
      price_euros: 199,
      processing_days: 1,
      category: 'UBER_EATS',
      icon: CreditCard,
      image: 'https://owvwqdcgtpngbtfdkhwt.supabase.co/storage/v1/object/public/license-images/uber_eats_activate',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'uber-eats-account-unlock',
      name_de: 'Uber Eats Konto entsperren',
      description_de: 'Professionelle Entsperrung von gesperrten oder deaktivierten Uber Eats Konten mit Garantie.',
      price_euros: 399,
      processing_days: 5,
      category: 'UBER_EATS',
      icon: Award,
      image: 'https://owvwqdcgtpngbtfdkhwt.supabase.co/storage/v1/object/public/license-images/uber_eats_unlock',
      color: 'from-orange-500 to-orange-600'
    }
  ])
  const [filteredAdditionalServices, setFilteredAdditionalServices] = useState<AdditionalService[]>([])

  useEffect(() => {
    fetchLicenseTypes()
    setFilteredAdditionalServices(additionalServices)
  }, [])

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = licenseTypes.filter(item =>
      (item.name_de || item.name_en || '').toLowerCase().includes(lowercasedFilter) ||
      (item.category || '').toLowerCase().includes(lowercasedFilter) ||
      (item.description_de || '').toLowerCase().includes(lowercasedFilter)
    );
    setFilteredLicenses(filteredData);

    const filteredAddServices = additionalServices.filter(item =>
      item.name_de.toLowerCase().includes(lowercasedFilter) ||
      item.description_de.toLowerCase().includes(lowercasedFilter) ||
      item.category.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredAdditionalServices(filteredAddServices);
  }, [searchTerm, licenseTypes, additionalServices]);

  const fetchLicenseTypes = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }

    try {
      // Vérifier d'abord si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using fallback data')
        setDatabaseStatus('disconnected')
        setLicenseTypes(fallbackLicenseTypes)
        setFilteredLicenses(fallbackLicenseTypes)
        toast.error('Datenbank nicht verfügbar - Zeige gespeicherte Daten')
        return
      }

      setDatabaseStatus('loading')
      const { data, error } = await supabase
        .from('license_types')
        .select('*')
        .eq('is_active', true)
        .order('category')

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      setDatabaseStatus('connected')
      setLicenseTypes(data || fallbackLicenseTypes)
      setFilteredLicenses(data || fallbackLicenseTypes)
      
      if (!isRetry && retryCount === 0) {
        toast.success('Dienste erfolgreich geladen')
      }
      
    } catch (error: any) {
      console.error('Error fetching license types:', error)
      setDatabaseStatus('disconnected')
      setLicenseTypes(fallbackLicenseTypes)
      setFilteredLicenses(fallbackLicenseTypes)
      
      // Afficher un message d'erreur en fonction du type d'erreur
      if (error.message.includes('Network')) {
        toast.error('Verbindungsfehler - Zeige gespeicherte Daten')
      } else if (error.message.includes('Database')) {
        toast.error('Datenbankfehler - Zeige gespeicherte Daten')
      } else {
        toast.error('Fehler beim Laden der Dienste - Zeige gespeicherte Daten')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    fetchLicenseTypes(true)
  }

  const getCategoryIcon = (category: string) => {
    if (['AM', 'A1', 'A2', 'A'].includes(category)) return Bike;
    if (['B1', 'B2', 'B', 'BE'].includes(category)) return Car;
    if (['C1', 'C2', 'C', 'C1E', 'CE'].includes(category)) return Truck;
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) return Bus;
    return Car;
  }

  const getCategoryColor = (category: string) => {
    if (['AM', 'A1', 'A2', 'A'].includes(category)) return 'from-orange-500 to-red-500';
    if (['B1', 'B2', 'B', 'BE'].includes(category)) return 'from-blue-500 to-blue-600';
    if (['C1', 'C2', 'C', 'C1E', 'CE'].includes(category)) return 'from-green-500 to-green-600';
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) return 'from-teal-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  }

  const getCategoryImage = (category: string) => {
    if (['AM', 'A1', 'A2', 'A'].includes(category)) {
      return '/images/motorcycle-default.jpg';
    }
    if (['B1', 'B2', 'B', 'BE'].includes(category)) {
      return '/images/car-default.jpg';
    }
    if (['C1', 'C2', 'C', 'C1E', 'CE'].includes(category)) {
      return '/images/truck-default.jpg';
    }
    if (['D1', 'D', 'D1E', 'DE'].includes(category)) {
      return '/images/bus-default.jpg';
    }
    return '/images/default-license.jpg';
  }

  const requirements = [
    { icon: FileText, text: t('services.requirement1') },
    { icon: Camera, text: t('services.requirement2') },
    { icon: Edit, text: t('services.requirement3') },
    { icon: Mail, text: t('services.requirement4') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 max-w-md">
            {databaseStatus === 'loading' 
              ? 'Dienste werden geladen...'
              : 'Fallback-Daten werden geladen...'
            }
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Versuch {retryCount + 1}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...pageSEO.services} />
      
      {/* Indicateur de statut de la base de données */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {databaseStatus === 'connected' ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">Online</span>
                </>
              ) : databaseStatus === 'disconnected' ? (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700">Offline - Gespeicherte Daten</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700">Verbindung wird hergestellt...</span>
                </>
              )}
            </div>
            
            {databaseStatus === 'disconnected' && (
              <button
                onClick={handleRetry}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Erneut versuchen
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('services.title')}
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('services.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-full border-gray-300 pl-10 pr-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Affichage du nombre de résultats */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredLicenses.length + filteredAdditionalServices.length} Dienste gefunden
              {searchTerm && ` für "${searchTerm}"`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLicenses.map((license, index) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <img 
                    src={license.image_url || getCategoryImage(license.category)} 
                    alt={license.name_de} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getCategoryImage(license.category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(license.category)} rounded-lg flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">{license.category}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl">{license.name_de}</h3>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{license.description_de}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-german-red">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {license.processing_days} {t('services.days')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 font-bold text-lg">
                      <Euro className="w-4 h-4" />
                      <span>{license.price_gross_euros.toLocaleString('de-DE')} €</span>
                    </div>
                  </div>

                  <Link
                    to={user ? `/application/form?license=${license.id}` : "/register"}
                    className="mt-auto w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white font-semibold rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-300"
                  >
                    {t('services.select')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}

            {filteredAdditionalServices.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (filteredLicenses.length + index) * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col"
                >
                  <div className="relative">
                    <img 
                      src={service.image} 
                      alt={service.name_de} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/service-fallback.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center shadow-lg`}>
                        <ServiceIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl">{service.name_de}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{service.description_de}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-german-red">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {service.processing_days} {t('services.days')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 font-bold text-lg">
                        <Euro className="w-4 h-4" />
                        <span>{service.price_euros.toLocaleString('de-DE')} €</span>
                      </div>
                    </div>

                    <Link
                      to="/contact"
                      className="mt-auto w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white font-semibold rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-300"
                    >
                      {t('services.select')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {filteredLicenses.length === 0 && filteredAdditionalServices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Kein Service gefunden</p>
              <p className="text-gray-400 mb-4">
                Versuchen Sie andere Suchbegriffe oder kontaktieren Sie uns für individuelle Anfragen.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kontakt aufnehmen
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('services.requirements_title')}</h2>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">{t('services.requirements_desc')}</p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {requirements.map((req, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-german-red rounded-full flex items-center justify-center">
                  <req.icon className="w-5 h-5" />
                </div>
                <p className="ml-4 text-gray-700">{req.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-german-black via-german-red to-german-gold">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {t('services.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {t('services.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-german-red font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                {t('services.cta.contact')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-german-red transition-all duration-300"
              >
                {t('services.cta.start')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}