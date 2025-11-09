import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Breadcrumbs from '../components/ui/Breadcrumbs';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <Breadcrumbs />
        </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.login.title')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login.subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
            <Input
              id="email-address"
              type="email"
              autoComplete="email"
              label={t('auth.email')}
              registration={register('email', { required: t('auth.validation.email_required') })}
              error={errors.email?.message}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              label={t('auth.password')}
              registration={register('password', { required: t('auth.validation.password_required') })}
              error={errors.password?.message}
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-german-red hover:text-blue-500">
                {t('auth.forgot_password')}
              </a>
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {t('auth.login_button')}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="font-medium text-german-red hover:text-blue-500">
              {t('auth.sign_up')}
            </Link>
          </p>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
