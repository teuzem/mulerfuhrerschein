import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Profile } from '../../lib/supabase';

interface ProfileCompletionProps {
  profile: Profile | null;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ profile }) => {
  const { t } = useTranslation();

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const fields = ['full_name', 'phone', 'neph_number', 'avatar_url'];
    const filledFields = fields.filter(field => !!profile[field as keyof Profile]);
    return Math.round((filledFields.length / fields.length) * 100);
  }, [profile]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Profil vervollständigen</h3>
      <p className="text-sm text-gray-600 mb-4">Vervollständigen Sie Ihr Profil für eine bessere Erfahrung</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercent}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className="text-right text-sm font-medium text-gray-700 mt-2">{completionPercent}%</p>
    </div>
  );
};

export default ProfileCompletion;
