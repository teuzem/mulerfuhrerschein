import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { zxcvbn } from '@zxcvbn-ts/core';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Tab } from '@headlessui/react';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import AvatarEditor from '../../components/dashboard/AvatarEditor';
import PasswordStrengthIndicator from '../../components/dashboard/PasswordStrengthIndicator';
import SocialLinksInput from '../../components/dashboard/SocialLinksInput';
import Switch from '../../components/ui/Switch';

import { User as UserIcon, Phone, Hash, Languages, Home, Building, MapPin, Text, Eye, Shield, Settings, Contact } from 'lucide-react';
import { regions } from '../../lib/constants';

type ProfileFormValues = {
  full_name: string;
  phone: string;
  neph_number: string;
  bio: string;
  address: string;
  city: string;
  postal_code: string;
  region: { value: string; label: string } | null;
  social_links: { platform: string; url: string }[];
  is_public: boolean;
};

type PasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

const DashboardProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile, refreshProfile } = useAuth();
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty: isProfileDirty } } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: '', phone: '', neph_number: '', bio: '', address: '', city: '', postal_code: '', region: null, social_links: [], is_public: false,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "social_links" });
  const { handleSubmit: handlePasswordSubmit, reset: resetPassword, watch, control: passwordControl } = useForm<PasswordFormValues>();
  
  const newPassword = watch('newPassword');
  const passwordStrengthValue = useMemo(() => newPassword ? zxcvbn(newPassword).score : 0, [newPassword]);

  useEffect(() => {
    if (profile?.avatar_url) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
      setAvatarUrl(data.publicUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [profile?.avatar_url]);

  useEffect(() => {
    if (profile) {
      const currentRegion = regions.find(r => r.value === profile.region);
      const socialLinksArray = profile.social_links ? Object.entries(profile.social_links).map(([platform, url]) => ({ platform, url })) : [];
      reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        neph_number: profile.neph_number || '',
        bio: profile.bio || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        region: currentRegion || null,
        social_links: socialLinksArray,
        is_public: profile.is_public || false,
      });
    }
  }, [profile, reset]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const socialLinksObject = data.social_links.reduce((acc, link) => {
        if (link.url) acc[link.platform] = link.url;
        return acc;
      }, {} as { [key: string]: string });

      await updateProfile({ 
        ...data, 
        region: data.region?.value,
        social_links: socialLinksObject
      });
      toast.success('Profil mis à jour avec succès!');
    } catch(e) {
      // Error handled in context
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (passwordStrengthValue < 2) {
      toast.error("Le mot de passe est trop faible.");
      return;
    }
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      toast.success(t('dashboard.profile.password.success'));
      resetPassword();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLanguageChange = async (lang: 'fr' | 'en') => {
    try {
      await updateProfile({ preferred_language: lang });
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error("Failed to update language preference");
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!profile) return;
    setIsAvatarUploading(true);
    try {
      const filePath = `${profile.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      await updateProfile({ avatar_url: filePath });
      await refreshProfile();
      toast.success('Avatar aktualisiert!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAvatarUploading(false);
    }
  };

  if (!profile) return null;

  const TABS = [
    { name: 'Öffentlich', icon: Eye },
    { name: 'Kontakt', icon: Contact },
    { name: 'Sicherheit', icon: Shield },
    { name: 'Einstellungen', icon: Settings },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <DashboardHeader
        title="Profil"
        subtitle="Verwalten Sie Ihre persönlichen Informationen"
        icon={UserIcon}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avatar</h3>
            <AvatarEditor currentAvatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} uploading={isAvatarUploading} />
          </div>
          <ProfileCompletion profile={profile} />
        </div>

        <div className="lg:col-span-2">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {TABS.map((tab) => (
                <Tab key={tab.name} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2
                        ${selected ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}
                    >
                      <tab.icon className="w-5 h-5"/> {tab.name}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              <form onSubmit={handleSubmit(onProfileSubmit)}>
                <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">Öffentlich</h3>
                  <Controller name="full_name" control={control} render={({ field }) => <Input label={t('auth.full_name')} registration={field} icon={<UserIcon className="w-5 h-5 text-gray-400" />} />} />
                  <Controller name="bio" control={control} render={({ field }) => <div><label className="block text-sm font-medium text-gray-700 mb-1">Biografie</label><textarea {...field} placeholder="Erzählen Sie uns etwas über sich..." rows={3} className="w-full p-2 border border-gray-300 rounded-lg" /></div>} />
                  <h4 className="text-lg font-semibold text-gray-700 pt-4 border-t">Social Media</h4>
                  <SocialLinksInput control={control} fields={fields} append={append} remove={remove} />
                  <h4 className="text-lg font-semibold text-gray-700 pt-4 border-t">Öffentliches Profil</h4>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-600 max-w-xs">Ihr Profil für andere sichtbar machen</span>
                    <Controller name="is_public" control={control} render={({ field }) => <Switch enabled={field.value} setEnabled={field.onChange} />} />
                  </div>
                </Tab.Panel>
                <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">Kontakt</h3>
                  <Controller name="phone" control={control} render={({ field }) => <Input label={t('auth.phone')} registration={field} icon={<Phone className="w-5 h-5 text-gray-400" />} />} />
                  <Controller name="neph_number" control={control} render={({ field }) => <Input label={t('application.form.neph')} registration={field} icon={<Hash className="w-5 h-5 text-gray-400" />} />} />
                  <h4 className="text-lg font-semibold text-gray-700 pt-4 border-t">Adresse</h4>
                  <Controller name="address" control={control} render={({ field }) => <Input label={t('application.form.address')} registration={field} icon={<Home className="w-5 h-5 text-gray-400" />} />} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Controller name="city" control={control} render={({ field }) => <Input label={t('application.form.city')} registration={field} icon={<Building className="w-5 h-5 text-gray-400" />} />} />
                    <Controller name="postal_code" control={control} render={({ field }) => <Input label={t('application.form.postal_code')} registration={field} icon={<MapPin className="w-5 h-5 text-gray-400" />} />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('application.form.region')}</label>
                    <Controller name="region" control={control} render={({ field }) => <Select {...field} options={regions} placeholder={t('common.select_prompt')} />} />
                  </div>
                </Tab.Panel>

                <div className="text-right mt-6">
                  <Button type="submit" isLoading={isProfileLoading} disabled={!isProfileDirty}>{t('common.save')}</Button>
                </div>
              </form>

              <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg space-y-6">
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">Passwort ändern</h3>
                  <Controller name="newPassword" control={passwordControl} rules={{ required: true, minLength: 6 }} render={({ field, fieldState }) => <PasswordInput label="Neues Passwort" registration={field} error={fieldState.error?.message} />} />
                  {newPassword && <PasswordStrengthIndicator strength={passwordStrengthValue} />}
                  <Controller name="confirmPassword" control={passwordControl} rules={{ required: true, validate: value => value === newPassword || 'Passwörter stimmen nicht überein' as string }} render={({ field, fieldState }) => <PasswordInput label="Passwort bestätigen" registration={field} error={fieldState.error?.message} />} />
                  <div className="text-right">
                    <Button type="submit" isLoading={isPasswordLoading}>Passwort aktualisieren</Button>
                  </div>
                </form>
              </Tab.Panel>
              <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Einstellungen</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Languages className="w-5 h-5 text-gray-400 mr-2" />
                    Sprache
                  </label>
                  <select value={profile.preferred_language || i18n.language} onChange={(e) => handleLanguageChange(e.target.value as 'fr' | 'en')} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option value="fr">Französisch</option>
                    <option value="en">Englisch</option>
                  </select>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardProfile;
