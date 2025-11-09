import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, Message, Profile, PresenceState, TypingEvent, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import ParticipantProfileView from './ParticipantProfileView';

interface ChatWindowProps {
  conversationId: string;
  participant: Conversation['other_participant'];
  onSwitchConversation: (conversationId: string) => void;
  onBack: () => void;
}

type MessageWithProfile = Message & {
  sender_profile: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, participant: initialParticipant, onSwitchConversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'profile'>('chat');
  const [participant, setParticipant] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .is('read_at', null)
      .neq('user_id', user.id);

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
    const profilesMap = new Map<string, Pick<Profile, 'id' | 'full_name' | 'avatar_url'>>();

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) console.error('Error fetching profiles for messages:', profilesError);
      else profilesData?.forEach(p => profilesMap.set(p.id, p));
    }
    
    const enrichedMessages: MessageWithProfile[] = messagesData.map(msg => ({
      ...msg,
      sender_profile: profilesMap.get(msg.user_id) || null,
    }));
    setMessages(enrichedMessages);
    setLoading(false);
  }, [conversationId, user]);

  useEffect(() => {
    if (initialParticipant?.id) {
      supabase.from('profiles').select('*').eq('id', initialParticipant.id).single().then(({ data }) => {
        if (data) setParticipant(data);
      });
    }
    fetchMessages();
  }, [fetchMessages, initialParticipant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!participant?.id) return;

    const presenceChannel = supabase.channel(`online-users:${participant.id}`);
    const typingChannel = supabase.channel(`typing-${conversationId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState<PresenceState>();
        const isUserOnline = !!presenceState[participant.id];
        setIsOnline(isUserOnline);
      })
      .subscribe();

    typingChannel
      .on<TypingEvent>('broadcast', { event: 'TYPING_START' }, (payload) => {
        if (payload.payload.user_id === participant.id) setIsTyping(true);
      })
      .on<TypingEvent>('broadcast', { event: 'TYPING_STOP' }, (payload) => {
        if (payload.payload.user_id === participant.id) setIsTyping(false);
      })
      .subscribe();
      
    const messageChannel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const newMessage = payload.new as Message;
          const senderProfile = newMessage.user_id === user?.id 
            ? null
            : participant;
          
          const enrichedNewMessage: MessageWithProfile = {
            ...newMessage,
            sender_profile: senderProfile ? { full_name: senderProfile.full_name || '', avatar_url: senderProfile.avatar_url || null } : null,
          };
          
          setMessages(prev => [...prev, enrichedNewMessage]);
          
          if (newMessage.user_id !== user?.id) {
            await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [conversationId, user, participant]);

  const renderPresence = () => {
    if (isTyping) return <span className="text-sm text-blue-500 animate-pulse">est en train d'écrire...</span>;
    if (isOnline) return <span className="text-sm text-green-500">En ligne</span>;
    if (participant?.last_seen) {
      const lastSeenDate = new Date(participant.last_seen);
      const now = new Date();
      const diffMinutes = Math.round((now.getTime() - lastSeenDate.getTime()) / 60000);
      if (diffMinutes < 1) return `Vu à l'instant`;
      if (diffMinutes < 60) return `Vu il y a ${diffMinutes} min`;
      if (diffMinutes < 1440) return `Vu il y a ${Math.floor(diffMinutes / 60)} h`;
      return `Vu le ${lastSeenDate.toLocaleDateString()}`;
    }
    return <span className="text-sm text-gray-400">Hors ligne</span>;
  };

  if (viewMode === 'profile' && participant) {
    return <ParticipantProfileView participant={participant} onBack={() => setViewMode('chat')} />;
  }

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 md:hidden">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-grow flex items-center cursor-pointer" onClick={() => setViewMode('profile')}>
          {participant ? (
            <>
              <div className="relative">
                <Avatar name={participant.full_name || '?'} avatarUrl={participant.avatar_url} size="md" />
                {isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-lg">{participant.full_name || 'Utilisateur inconnu'}</h3>
                {renderPresence()}
              </div>
            </>
          ) : (
            <div className="flex items-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-3 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.user_id === user!.id} onSwitchConversation={onSwitchConversation} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
};

export default ChatWindow;
