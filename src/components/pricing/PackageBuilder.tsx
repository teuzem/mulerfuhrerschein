import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { LicenseType } from '../../lib/supabase';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PackageBuilderProps {
  licenseTypes: LicenseType[];
}

const PackageBuilder: React.FC<PackageBuilderProps> = ({ licenseTypes }) => {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedLicenses, setSelectedLicenses] = useState<LicenseType[]>([]);

  useEffect(() => {
    const licensesInPackage = licenseTypes.filter(lt => selectedIds.has(lt.id));
    setSelectedLicenses(licensesInPackage);

    let currentTotal = 0;
    licensesInPackage.forEach(license => {
      currentTotal += license.price_gross_euros;
    });

    let currentDiscount = 0;
    if (licensesInPackage.length === 2) {
      currentDiscount = currentTotal * 0.05; // 5% discount
    } else if (licensesInPackage.length >= 3) {
      currentDiscount = currentTotal * 0.10; // 10% discount
    }

    setTotalPrice(currentTotal);
    setDiscount(currentDiscount);
    setFinalPrice(currentTotal - currentDiscount);
  }, [selectedIds, licenseTypes]);

  const handleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <Package className="w-8 h-8 text-green-600 mr-4" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Paket-Builder</h3>
          <p className="text-gray-600">Erstellen Sie Ihr Führerscheinpaket und sparen Sie Geld!</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-2">1. Wählen Sie die zu inkludierenden Führerscheine:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {licenseTypes.map(lt => (
          <button key={lt.id} className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${selectedIds.has(lt.id) ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleSelect(lt.id)}>
            <p className="font-bold">{`Führerschein ${lt.category}`}</p>
            <p className="text-sm text-gray-600">{`${lt.price_gross_euros}€`}</p>
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-2 mt-8">2. Überprüfen Sie Ihr Paket:</p>
      <div className="bg-gray-50 p-6 rounded-lg mt-2">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Paketzusammenfassung</h4>
        
        <div className="mb-4 space-y-2">
          {selectedLicenses.length > 0 ? (
            selectedLicenses.map(license => (
              <div key={license.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{`Führerschein ${license.category} - ${license.name_de}`}</span>
                <span className="font-medium text-gray-800">{`${license.price_gross_euros.toFixed(2)}€`}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Wählen Sie Führerscheine aus, um ein Paket zu erstellen.</p>
          )}
        </div>

        {selectedLicenses.length > 0 && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between items-center text-gray-600"><span>Gesamt vor Rabatt</span><span className="font-medium">{totalPrice.toFixed(2)}€</span></div>
            <div className="flex justify-between items-center text-green-600">
              <span>
                Paketrabatt 
                {selectedIds.size === 2 && ' (5%)'}
                {selectedIds.size >= 3 && ' (10%)'}
              </span>
              <span className="font-medium">-{discount.toFixed(2)}€</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center text-xl font-bold text-gray-900"><span>Gesamt (inkl. MwSt.)</span><span>{finalPrice.toFixed(2)}€</span></div>
          </div>
        )}
      </div>

      <Button as={Link} to={user ? `/application/form?package=${Array.from(selectedIds).join(',')}` : '/register'} disabled={selectedIds.size === 0} className="w-full mt-6">
        Dieses Paket bestellen <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default PackageBuilder;
