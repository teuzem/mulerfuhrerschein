import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { supabase, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';

const DashboardMessages: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Récupérer les conversations où l'utilisateur est participant
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      
      if (participantsError) {
        console.error('Error fetching user conversations:', participantsError);
        toast.error("Fehler beim Laden der Nachrichten.");
        return;
      }
      
      if (!participantsData || participantsData.length === 0) {
        setConversations([]);
        return;
      }
      
      const conversationIds = participantsData.map(p => p.conversation_id);
      
      // Récupérer les détails des conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });
      
      if (conversationsError) {
        console.error('Error fetching conversations details:', conversationsError);
        toast.error("Fehler beim Laden der Nachrichten.");
        return;
      }
      
      // Pour chaque conversation, récupérer l'autre participant et le dernier message
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Trouver l'autre participant
          const { data: otherParticipant, error: participantError } = await supabase
            .from('conversation_participants')
            .select('user_id, profiles!inner(*)')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .single();
          
          // Récupérer le dernier message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          // Compter les messages non lus
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .is('read_at', null);
          
          return {
            id: conv.id,
            created_at: conv.created_at,
            other_participant: otherParticipant?.profiles || {},
            last_message_text: lastMessage?.content || null,
            last_message_time: lastMessage?.created_at || null,
            unread_count: unreadCount || 0
          };
        })
      );
      
      setConversations(enrichedConversations.filter(c => c.other_participant.id));
    } catch (error: any) {
      console.error('Error in fetchConversations:', error);
      toast.error("Fehler beim Laden der Nachrichten.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const changesChannel = supabase
        .channel('realtime-all-conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
        .subscribe();
      return () => { supabase.removeChannel(changesChannel); };
    }
  }, [user, fetchConversations]);
  
  const handleSwitchConversation = async (conversationId: string) => {
    let newConvo = conversations.find(c => c.id === conversationId);
    if (newConvo) {
      setSelectedConversation(newConvo);
    } else {
      await fetchConversations();
      // Re-check after fetching
      const updatedConvo = conversations.find(c => c.id === conversationId);
      if (updatedConvo) {
        setSelectedConversation(updatedConvo);
      } else {
        toast.error("Konversation konnte nicht gefunden werden.");
      }
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(c => 
      c.other_participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex-grow flex border border-gray-200 bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
        
        <div className="flex w-full h-full">
          <div className={`w-full md:w-1/3 md:flex flex-col border-r border-gray-200 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <ConversationList
              conversations={filteredConversations}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={setSelectedConversation}
              onRefresh={fetchConversations}
            />
          </div>
          
          <div className={`w-full md:w-2/3 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <ChatWindow
                key={selectedConversation.id}
                conversationId={selectedConversation.id}
                participant={selectedConversation.other_participant}
                onSwitchConversation={handleSwitchConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-grow flex-col items-center justify-center text-center text-gray-500 bg-gray-50 hidden md:flex">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold">Nachrichten</h2>
                <p className="max-w-xs">Wählen Sie eine Konversation aus, um zu beginnen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardMessages;
