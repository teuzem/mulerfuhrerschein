import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  titleEn?: string;
  titleFr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  keywords?: string;
  keywordsEn?: string;
  keywordsFr?: string;
  image?: string;
  url?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: any;
  businessType?: 'driverSchool' | 'uberEats' | 'both';
  locale?: 'de' | 'en' | 'fr';
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MüllerFührerschein - Deutscher Führerschein | Führerschein Deutschland | Uber Eats Fahrer',
  titleEn = 'MüllerLicense - German Driving License | Germany Driver License | Uber Eats Driver',
  titleFr = 'MüllerFührerschein - Deutscher Führerschein | Führerschein Deutschland | Uber Eats Fahrer',
  
  description = 'MüllerFührerschein - Ihr Experte für deutschen Führerschein und Uber Eats Fahrerlaubnis. Schneller, zuverlässiger und legaler Service für alle Führerscheinklassen in Deutschland.',
  descriptionEn = 'MüllerLicense - Your expert for German driving license and Uber Eats driver permit. Fast, reliable and legal service for all driving license classes in Germany.',
  descriptionFr = 'MüllerFührerschein - Ihr Experte für deutschen Führerschein und Uber Eats Fahrerlaubnis. Schneller, zuverlässiger und legaler Service für alle Führerscheinklassen in Deutschland.',
  
  keywords = 'deutscher Führerschein, Führerschein Deutschland, Uber Eats Fahrer, Führerschein Klasse B, Führerschein A, Führerschein C, Mopedführerschein, MüllerFührerschein',
  keywordsEn = 'German driving license, Germany driver license, Uber Eats driver, driving license class B, motorcycle license, truck license, moped license, MüllerLicense',
  keywordsFr = 'deutscher Führerschein, Führerschein Deutschland, Uber Eats Fahrer, Führerschein Klasse B, Führerschein A, Führerschein C, Mopedführerschein, MüllerFührerschein',
  
  image = 'https://mulerfuhrerschein.de/images/og-image.jpg',
  url = 'https://mulerfuhrerschein.de',
  canonicalUrl,
  noindex = false,
  structuredData,
  businessType = 'both',
  locale = 'de',
  city = 'München',
  address = 'Musterstraße 123, 80331 München, Deutschland',
  phone = '+49-89-123456789',
  email = 'info@mulerfuhrerschein.de',
}) => {
  useEffect(() => {
    // Titre dynamique selon la locale
    let fullTitle = title;
    let descriptionToUse = description;
    let keywordsToUse = keywords;

    switch (locale) {
      case 'en':
        fullTitle = titleEn || title;
        descriptionToUse = descriptionEn || description;
        keywordsToUse = keywordsEn || keywords;
        break;
      case 'fr':
        fullTitle = titleFr || title;
        descriptionToUse = descriptionFr || description;
        keywordsToUse = keywordsFr || keywords;
        break;
      default: // 'de'
        fullTitle = title;
        descriptionToUse = description;
        keywordsToUse = keywords;
    }

    const finalTitle = fullTitle.includes('MüllerFührerschein') || fullTitle.includes('MüllerLicense') || fullTitle.includes('MüllerPermis') 
      ? fullTitle 
      : `${fullTitle} | MüllerFührerschein`;
    document.title = finalTitle;

    // Définir la langue du document
    document.documentElement.lang = locale;

    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Métadonnées de base
    setMetaTag('description', descriptionToUse);
    setMetaTag('keywords', keywordsToUse);
    
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    }

    // Métadonnées Open Graph avec support multilingue
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', descriptionToUse, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', canonicalUrl || url, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:locale', locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'fr_FR', true);
    
    // URLs alternatives pour Open Graph
    setMetaTag('og:locale:alternate', locale === 'de' ? 'en_US' : 'de_DE', true);
    setMetaTag('og:locale:alternate', locale === 'de' ? 'fr_FR' : 'de_DE', true);

    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', descriptionToUse);
    setMetaTag('twitter:image', image);

    // Métadonnées géographiques pour Allemagne
    setMetaTag('geo.region', 'DE-BY', true);
    setMetaTag('geo.placename', city, true);
    setMetaTag('geo.position', '48.1351;11.5820', true);
    setMetaTag('ICBM', '48.1351, 11.5820', true);

    // URL canonique
    const canonicalUrlToUse = canonicalUrl || url;
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = canonicalUrlToUse;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrlToUse;
      document.head.appendChild(link);
    }

    // Liens alternatifs pour les langues
    const currentPath = window.location.pathname;
    const baseUrl = 'https://mulerfuhrerschein.de';
    
    const languages = [
      { lang: 'de', href: `${baseUrl}${currentPath}` },
      { lang: 'en', href: `${baseUrl}/en${currentPath}` },
      { lang: 'fr', href: `${baseUrl}/fr${currentPath}` }
    ];

    languages.forEach(({ lang, href }) => {
      let altLink = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement;
      if (!altLink) {
        altLink = document.createElement('link');
        altLink.rel = 'alternate';
        altLink.hreflang = lang;
        document.head.appendChild(altLink);
      }
      altLink.href = href;
    });

    // Données structurées Schema.org
    let schemaData = {};

    if (businessType === 'driverSchool' || businessType === 'both') {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "DrivingSchool",
        "name": "MüllerFührerschein",
        "description": descriptionToUse,
        "url": canonicalUrlToUse,
        "logo": `${baseUrl}/images/logo.png`,
        "image": image,
        "telephone": phone,
        "email": email,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Musterstraße 123",
          "addressLocality": city,
          "postalCode": "80331",
          "addressCountry": "DE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "48.1351",
          "longitude": "11.5820"
        },
        "areaServed": "Deutschland",
        "priceRange": "€€",
        "openingHours": [
          "Mo-Fr 09:00-18:00",
          "Sa 09:00-16:00"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127"
        },
        "serviceType": [
          "Führerschein Klasse B",
          "Führerschein Klasse A",
          "Führerschein Klasse C",
          "Mopedführerschein",
          "Wiedererteilung Führerschein"
        ],
        "availableLanguage": ["de", "en", "fr"],
        "sameAs": [
          "https://www.facebook.com/mulerfuhrerschein",
          "https://www.instagram.com/mulerfuhrerschein",
          "https://www.linkedin.com/company/mulerfuhrerschein"
        ]
      };
    }

    if (businessType === 'uberEats' || businessType === 'both') {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "FoodEstablishment",
        "name": "MüllerFührerschein - Uber Eats Fahrer Service",
        "description": "Professioneller Service für Uber Eats Fahrerlaubnis in Deutschland. Schnelle Bearbeitung, rechtliche Sicherheit.",
        "url": canonicalUrlToUse,
        "telephone": phone,
        "email": email,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Musterstraße 123",
          "addressLocality": city,
          "postalCode": "80331",
          "addressCountry": "DE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "48.1351",
          "longitude": "11.5820"
        },
        "areaServed": "Deutschland",
        "serviceType": "Uber Eats Fahrerlaubnis",
        "availableLanguage": ["de", "en", "fr"],
        "makesOffer": {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Uber Eats Fahrerlaubnis Service",
            "description": "Komplette Beratung und Antragstellung für Uber Eats Fahrerlaubnis"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "priceCurrency": "EUR",
            "price": "299.00"
          }
        }
      };
    }

    // Utiliser les données structurées personnalisées si fournies, sinon utiliser les données par défaut
    const finalSchemaData = structuredData || schemaData;

    if (finalSchemaData && Object.keys(finalSchemaData).length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(finalSchemaData, null, 2);
      document.head.appendChild(script);
    }

    // Métadonnées pour l'optimisation SEO allemand
    if (locale === 'de') {
      setMetaTag('DC.title', finalTitle, true);
      setMetaTag('DC.creator', 'MüllerFührerschein', true);
      setMetaTag('DC.subject', 'Führerschein, Deutschland, Uber Eats', true);
      setMetaTag('DC.description', descriptionToUse, true);
      setMetaTag('DC.publisher', 'MüllerFührerschein', true);
      setMetaTag('DC.date', new Date().toISOString(), true);
      setMetaTag('DC.type', 'Text', true);
      setMetaTag('DC.format', 'text/html', true);
      setMetaTag('DC.language', 'de', true);
      setMetaTag('DC.rights', '© 2025 MüllerFührerschein. Alle Rechte vorbehalten.', true);
    }
  }, [
    title, titleEn, titleFr,
    description, descriptionEn, descriptionFr,
    keywords, keywordsEn, keywordsFr,
    image, url, canonicalUrl, noindex, structuredData,
    businessType, locale, city, address, phone, email
  ]);

  return null;
};

export default SEOHead;