import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Search } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationSelect: (conversationId: string) => void;
  onProfileSelect?: (profile: Profile) => void;
  mode?: 'startConversation' | 'shareProfile';
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onConversationSelect,
  onProfileSelect,
  mode = 'startConversation',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      return;
    }

    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user!.id)
        .ilike('full_name', `%${searchTerm}%`);
      
      if (error) {
        console.error(error);
        toast.error("Fehler bei der Benutzersuche.");
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, user, isOpen]);

  const handleSelectUser = async (selectedUser: Profile) => {
    if (!user) return;

    if (mode === 'shareProfile' && onProfileSelect) {
      onProfileSelect(selectedUser);
      onClose();
      return;
    }

    // Default mode: startConversation
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: selectedUser.id,
      });
      if (error) throw error;
      onConversationSelect(data);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Konversation kann nicht gestartet werden.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('messages.new.title')}>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('messages.new.search_placeholder')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="h-64 overflow-y-auto">
        {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
          <ul>
            {results.map(profile => (
              <li key={profile.id} onClick={() => handleSelectUser(profile)} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="md" />
                <span className="ml-3 font-medium">{profile.full_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default UserSearchModal;
