import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LicenseApplication } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

interface RecentApplicationsProps {
  applications: LicenseApplication[];
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

const RecentApplications: React.FC<RecentApplicationsProps> = ({ applications }) => {
  const { t } = useTranslation();
  const recentApps = applications.slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Aktuelle Anträge</h2>
      {recentApps.length > 0 ? (
        <ul className="space-y-4">
          {recentApps.map(app => (
            <li key={app.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">{app.license_type?.name_de || 'Führerschein'}</p>
                <p className="text-sm text-gray-500">{app.application_number || 'N/A'}</p>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Keine Anträge vorhanden</p>
      )}
      <Link to="/dashboard/applications" className="mt-4 text-sm font-medium text-german-red hover:text-red-800 flex items-center">
        Alle anzeigen
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
};

export default RecentApplications;
