import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Star, Clock, ShieldCheck, Headphones as HeadphonesIcon, CreditCard, FileText, Zap, Award, TrendingUp, ChevronDown, Sparkles } from 'lucide-react';

interface Feature {
  key: string;
  permisCode: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
  competitor3: boolean | string;
  highlight?: boolean;
}

const CompetitorComparison: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('main');

  const competitors = [
    { name: 'MüllerFührerschein', logo: '🏆', color: 'from-german-black via-german-red to-german-gold', highlight: true },
    { name: 'Führerschein Express', logo: '🏢', color: 'from-gray-400 to-gray-500' },
    { name: 'Deutsche Fahrschule', logo: '🏪', color: 'from-gray-400 to-gray-500' },
    { name: 'AutoMobil Service', logo: '🏬', color: 'from-gray-400 to-gray-500' },
  ];

  const categories = [
    {
      id: 'main',
      title: 'Hauptmerkmale',
      icon: Star,
      features: [
        {
          key: 'Preistransparenz',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
          highlight: true,
        },
        {
          key: 'Bearbeitungszeit',
          permisCode: '7-15 Tage',
          competitor1: '30-45 Tage',
          competitor2: '20-30 Tage',
          competitor3: '25-40 Tage',
          highlight: true,
        },
        {
          key: 'Erfolgsquote',
          permisCode: '98%',
          competitor1: '85%',
          competitor2: '88%',
          competitor3: '82%',
          highlight: true,
        },
        {
          key: 'Online-Plattform',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
      ],
    },
    {
      id: 'service',
      title: 'Kundenservice',
      icon: HeadphonesIcon,
      features: [
        {
          key: 'Kundensupport',
          permisCode: '24/7 verfügbar',
          competitor1: 'Geschäftszeiten',
          competitor2: 'Geschäftszeiten',
          competitor3: 'Begrenzt',
        },
        {
          key: 'Mehrsprachig',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: 'Live-Tracking',
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
          highlight: true,
        },
        {
          key: 'Persönlicher Berater',
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: true,
        },
      ],
    },
    {
      id: 'payment',
      title: 'Zahlungsarten',
      icon: CreditCard,
      features: [
        {
          key: 'Zahlungsmethoden',
          permisCode: 'Alle Methoden',
          competitor1: 'Begrenzt',
          competitor2: 'Nur Karte',
          competitor3: 'Begrenzt',
        },
        {
          key: 'Ratenzahlung',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: 'Geld-zurück-Garantie',
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
          highlight: true,
        },
        {
          key: 'Keine versteckten Kosten',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
      ],
    },
    {
      id: 'documents',
      title: 'Dokumente & Verwaltung',
      icon: FileText,
      features: [
        {
          key: 'Dokumentenprüfung',
          permisCode: 'Sofort',
          competitor1: 'Manuell',
          competitor2: 'Langsam',
          competitor3: 'Manuell',
        },
        {
          key: 'Digitale Zustellung',
          permisCode: true,
          competitor1: false,
          competitor2: true,
          competitor3: false,
        },
        {
          key: 'Sichere Speicherung',
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: true,
        },
        {
          key: 'Automatische Erinnerungen',
          permisCode: true,
          competitor1: false,
          competitor2: false,
          competitor3: false,
        },
      ],
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-green-500 mx-auto" strokeWidth={3} />
      ) : (
        <X className="w-6 h-6 text-red-400 mx-auto" strokeWidth={2} />
      );
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 bg-clip-text text-transparent mb-3">
          Führerschein-Vergleich
        </h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Vergleichen Sie bis zu 3 Führerscheine nebeneinander.
        </p>
      </div>

      <div className="mb-8 bg-gradient-to-r from-german-black via-german-red to-german-gold p-6 rounded-2xl shadow-lg">
        <div className="grid grid-cols-4 gap-4">
          {competitors.map((competitor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`text-center ${competitor.highlight ? 'transform scale-110' : ''}`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${competitor.color} rounded-xl mb-3 shadow-lg ${competitor.highlight ? 'ring-4 ring-yellow-400' : ''}`}>
                <span className="text-3xl">{competitor.logo}</span>
              </div>
              <h4 className={`font-bold ${competitor.highlight ? 'text-white text-lg' : 'text-white/80 text-sm'}`}>
                {competitor.name}
              </h4>
              {competitor.highlight && (
                <div className="flex items-center justify-center mt-2 space-x-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-yellow-300 font-semibold">
                    Beste Wahl
                  </span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category, catIndex) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{category.title}</h4>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {category.features.map((feature, featureIndex) => (
                          <motion.tr
                            key={feature.key}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className={`${
                              featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } ${feature.highlight ? 'ring-2 ring-yellow-200 ring-inset' : ''}`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/4">
                              <div className="flex items-center">
                                {feature.highlight && (
                                  <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" />
                                )}
                                {feature.key}
                              </div>
                            </td>
                            <td className={`px-4 py-4 text-center ${feature.highlight ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}`}>
                              {renderValue(feature.permisCode)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor1)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor2)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {renderValue(feature.competitor3)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-german-black via-german-red to-german-gold p-6 rounded-2xl text-center shadow-xl"
      >
        <div className="flex items-center justify-center mb-4 space-x-2">
          <Award className="w-8 h-8 text-yellow-300" />
          <h4 className="text-2xl font-bold text-white">Warum uns wählen?</h4>
          <Award className="w-8 h-8 text-yellow-300" />
        </div>
        <p className="text-white/90 text-lg max-w-3xl mx-auto">
          MüllerFührerschein bietet den besten Service, die schnellste Bearbeitung und die höchste Erfolgsquote für alle Führerscheinklassen.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompetitorComparison;
