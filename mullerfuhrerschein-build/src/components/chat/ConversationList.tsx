import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, Profile, PresenceState, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { PlusCircle, Search } from 'lucide-react';
import UserSearchModal from './UserSearchModal';
import toast from 'react-hot-toast';

const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID;

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onRefresh: () => void;
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

const ConversationList: React.FC<ConversationListProps> = ({ conversations, loading, searchTerm, setSearchTerm, selectedConversationId, onSelectConversation, onRefresh }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchAdminProfile = async () => {
      if (!ADMIN_USER_ID || ADMIN_USER_ID === 'YOUR_ADMIN_USER_ID_HERE') return;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', ADMIN_USER_ID).single();
      if (error) console.warn("Profil administrateur non trouvé.");
      else setAdminProfile(data);
    };
    fetchAdminProfile();

    const presenceChannel = supabase.channel('online-users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState<PresenceState>();
        const onlineUserIds = Object.keys(newState);
        setOnlineUsers(new Set(onlineUserIds));
      })
      .subscribe();
    
    return () => { supabase.removeChannel(presenceChannel); };
  }, [user]);

  const handleAdminConversation = async () => {
    if (!user || !adminProfile) return;
    if (!ADMIN_USER_ID || ADMIN_USER_ID === 'YOUR_ADMIN_USER_ID_HERE') {
      toast.error("Administrator-ID ist nicht konfiguriert.");
      return;
    }
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: ADMIN_USER_ID,
      });
      if (error) throw error;
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Konversation kann nicht gestartet werden avec l'administrateur.");
    }
  };
  
  return (
    <>
      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onConversationSelect={() => {
          onRefresh();
        }}
      />
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('messages.title')}</h2>
          <button onClick={() => setIsSearchModalOpen(true)} className="p-2 text-gray-500 hover:text-german-red">
            <PlusCircle />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('messages.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-gray-300"
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
          <ul>
            {ADMIN_USER_ID && adminProfile && (
              <li onClick={handleAdminConversation} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedConversationId && conversations.find(c => c.id === selectedConversationId)?.other_participant.id === ADMIN_USER_ID ? 'bg-blue-50' : ''}`}>
                <div className="relative">
                  <Avatar name={adminProfile.full_name || "Admin"} avatarUrl={adminProfile.avatar_url} size="md" />
                  {onlineUsers.has(ADMIN_USER_ID) && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-sm">{adminProfile.full_name || "Admin PermisCode"}</p>
                  <p className="text-xs text-gray-500 truncate">Support administrateur</p>
                </div>
              </li>
            )}
            {conversations.map(convo => (
              <li key={convo.id} onClick={() => onSelectConversation(convo)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedConversationId === convo.id ? 'bg-blue-50' : ''}`}>
                <div className="relative">
                  <Avatar name={convo.other_participant.full_name || ''} avatarUrl={convo.other_participant.avatar_url} size="md" />
                  {onlineUsers.has(convo.other_participant.id) && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">
                      <Highlight text={convo.other_participant.full_name || ''} highlight={searchTerm} />
                    </p>
                    {convo.last_message_time && <p className="text-xs text-gray-400">{new Date(convo.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${convo.unread_count > 0 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>{convo.last_message_text || '...'}</p>
                    {convo.unread_count > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{convo.unread_count}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ConversationList;
