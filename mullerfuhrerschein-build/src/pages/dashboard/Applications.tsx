import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LicenseApplication } from '../../lib/supabase';
import { Eye, CreditCard, PlusCircle, FileText as FileTextIcon } from 'lucide-react';
import { DashboardData } from '../../hooks/useDashboardData';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/ui/Button';
import ApplicationStatusChart from '../../components/dashboard/ApplicationStatusChart';

interface DashboardApplicationsProps {
  data: DashboardData;
}

const ApplicationStatusBadge: React.FC<{ status: LicenseApplication['status'] }> = ({ status }) => {
  const { t } = useTranslation();
  const statusMap = {
    draft: { label: 'Entwurf', color: 'gray' },
    pending_payment: { label: 'Zahlung ausstehend', color: 'yellow' },
    submitted: { label: 'Eingereicht', color: 'blue' },
    in_review: { label: 'In Prüfung', color: 'purple' },
    approved: { label: 'Genehmigt', color: 'teal' },
    completed: { label: 'Abgeschlossen', color: 'green' },
    rejected: { label: 'Abgelehnt', color: 'red' },
  };

  const colorMap = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-german-gold',
    purple: 'bg-purple-100 text-purple-800',
    teal: 'bg-teal-100 text-teal-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  const { label, color } = statusMap[status] || statusMap.draft;
  const colorClasses = colorMap[color as keyof typeof colorMap];

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
      {label}
    </span>
  );
};

const DashboardApplications: React.FC<DashboardApplicationsProps> = ({ data }) => {
  const { t } = useTranslation();
  const { applications } = data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <DashboardHeader
        title="Anträge"
        subtitle="Verwalten Sie Ihre Führerschein-Anträge"
        icon={FileTextIcon}
      >
        <Button as={Link} to="/services" className="bg-white text-german-red hover:bg-gray-100">
          <PlusCircle className="w-5 h-5 mr-2" />
          Neuer Antrag
        </Button>
      </DashboardHeader>

      <ApplicationStatusChart applications={applications} />
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Typ</th>
                <th scope="col" className="px-6 py-3">Datum</th>
                <th scope="col" className="px-6 py-3">Betrag</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-700">{app.application_number || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{app.license_type?.name_de || 'Führerschein'}</td>
                  <td className="px-6 py-4">{new Date(app.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-medium">{app.total_amount.toFixed(2)}€</td>
                  <td className="px-6 py-4"><ApplicationStatusBadge status={app.status} /></td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <Link to={`/application/status/${app.id}`} className="p-2 text-gray-500 hover:text-german-red hover:bg-gray-100 rounded-full" title="Anzeigen">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {app.status === 'pending_payment' && (
                      <Link to={`/application/new?applicationId=${app.id}`} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full" title="Bezahlen">
                        <CreditCard className="w-4 h-4" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {applications.length === 0 && (
            <p className="text-center py-8 text-gray-500">Keine Anträge vorhanden</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardApplications;
