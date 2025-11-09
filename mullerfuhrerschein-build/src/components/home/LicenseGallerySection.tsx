import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bike, Car, Truck } from 'lucide-react';

const LicenseGallerySection = () => {
  const licenses = [
    {
      name: 'Motorradführerschein (A)',
      icon: Bike,
      img: 'https://images.unsplash.com/photo-1621649539237-77f635b75b9b?w=400&h=300&fit=crop&q=80',
    },
    {
      name: 'Autoführerschein (B)',
      icon: Car,
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&q=80',
    },
    {
      name: 'LKW-Führerschein (C)',
      icon: Truck,
      img: 'https://images.unsplash.com/photo-1581701353553-c9167eb68677?w=400&h=300&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">
            Führerschein-Galerie
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Entdecken Sie einige der Führerscheine, die wir Ihnen helfen zu erhalten.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {licenses.map((license, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-xl group"
            >
              <img src={license.img} alt={license.name} className="w-full h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <license.icon className="w-8 h-8 mb-2" />
                <h3 className="text-2xl font-bold">{license.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center px-8 py-3 bg-german-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
            Alle Dienstleistungen ansehen <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LicenseGallerySection;
