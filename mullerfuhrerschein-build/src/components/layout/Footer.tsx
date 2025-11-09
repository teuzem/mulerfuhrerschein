import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, Facebook, Twitter, Instagram, MapPin, Car } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-german-black via-german-red to-german-gold rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-german-gold" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-german-gold via-german-red to-german-gold bg-clip-text text-transparent">
                  {t('footer.company')}
                </h3>
                <p className="text-sm text-gray-400">Berlin • Deutschland</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Ihr vertrauenswürdiger Partner für die Erlangung aller Arten von deutschen Führerscheinen in Berlin und Deutschland. Schnell, sicher und 100% legal.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>Alexanderstraße 40, 10179 Berlin, Deutschland</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-german-red font-medium">
              <Car className="w-4 h-4" />
              <span>Ihr Führerschein-Service in Berlin</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-german-gold">{t('nav.home')}</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.home')}</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.services')}</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.pricing')}</Link></li>
              <li><Link to="/testimonials" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.testimonials')}</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.gallery')}</Link></li>
              <li><Link to="/clients" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.clients')}</Link></li>
              <li><Link to="/ubereats" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.uber_eats')}</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-german-gold transition-colors duration-200">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-german-red">{t('footer.contact.title')}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-german-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('contact.info.support')}</p>
                  <a href="mailto:mulerfurerschein@gmail.com" className="text-gray-300 hover:text-german-gold transition-colors duration-200 text-sm">
                    mulerfurerschein@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('contact.info.phone')}</p>
                  <a href="https://wa.me/4915212399096?text=Hallo%21%20Ich%20interessiere%20mich%20f%C3%BCr%20Ihren%20F%C3%BChrerschein-Kurs.%20K%C3%B6nnen%20Sie%20mir%20weitere%20Informationen%20geben%3F" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm">
                    +49 152 12399096
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-german-gold">{t('footer.social.title')}</h4>
            <div className="flex space-x-4 mb-6">
              <a href="https://facebook.com/mullerfuhrerschein" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-german-red rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors duration-200"><Facebook className="w-5 h-5" /></a>
              <a href="https://twitter.com/mullerfuhrerschein" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-german-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"><Twitter className="w-5 h-5" /></a>
              <a href="https://instagram.com/mullerfuhrerschein" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center hover:from-pink-600 hover:to-red-600 transition-all duration-200"><Instagram className="w-5 h-5" /></a>
            </div>
            <p className="text-sm text-gray-400">
              Folgen Sie <span className="text-german-gold font-medium">@mullerfuhrerschein</span> auf allen Netzwerken
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">{t('footer.copyright')}</p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/legal" className="text-gray-400 hover:text-german-gold transition-colors duration-200">{t('footer.links.legal')}</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-german-gold transition-colors duration-200">{t('footer.links.privacy')}</Link>
              <Link to="/terms" className="text-gray-400 hover:text-german-gold transition-colors duration-200">{t('footer.links.terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
