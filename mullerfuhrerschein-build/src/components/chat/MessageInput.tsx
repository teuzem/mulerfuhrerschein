import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase, TypingEvent, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Send, Paperclip, Smile, Gift, MapPin, Image as ImageIcon, User as UserIcon } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import GiphyPicker from './GiphyPicker';
import GalleryPickerModal from './GalleryPickerModal';
import MediaSendPreview from './MediaSendPreview';
import UserSearchModal from './UserSearchModal';
import MentionSuggestions from './MentionSuggestions';
import { debounce } from 'lodash';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const { user, profile } = useAuth();
  const { register, handleSubmit, setValue, getValues, reset } = useForm<{ content: string }>();
  const [isGiphyOpen, setIsGiphyOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isProfileShareModalOpen, setIsProfileShareModalOpen] = useState(false);
  const [filesToPreview, setFilesToPreview] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<Profile[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState<number | null>(null);

  const typingChannel = supabase.channel(`typing-${conversationId}`);

  const sendTypingStop = useCallback(
    debounce(async () => {
      if (!user) return;
      const event: TypingEvent = { event: 'TYPING_STOP', payload: { user_id: user.id, user_name: profile?.full_name || '' } };
      await typingChannel.send({ type: 'broadcast', event: event.event, payload: event.payload });
    }, 3000),
    [conversationId, user, profile]
  );

  const sendTypingStart = useCallback(async () => {
    if (!user) return;
    const event: TypingEvent = { event: 'TYPING_START', payload: { user_id: user.id, user_name: profile?.full_name || '' } };
    await typingChannel.send({ type: 'broadcast', event: event.event, payload: event.payload });
  }, [conversationId, user, profile]);


  useEffect(() => {
    const fetchMentions = async (query: string) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .neq('id', user.id)
        .limit(5);

      if (error) console.error(error);
      else {
        setMentionResults(data || []);
        setMentionIndex(0);
      }
    };

    if (mentionQuery !== null && mentionQuery.length >= 0) { // Show all users if query is empty
      fetchMentions(mentionQuery);
    } else {
      setMentionResults([]);
    }
  }, [mentionQuery, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;
    setValue('content', value);

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
        const query = textBeforeCursor.substring(lastAt + 1);
        if (!query.includes('\n')) {
            setMentionQuery(query);
            setMentionStartPosition(lastAt);
        } else {
            setMentionQuery(null);
        }
    } else {
        setMentionQuery(null);
    }
    
    if (value) {
      sendTypingStart();
      sendTypingStop();
    } else {
      sendTypingStop.cancel();
      sendTypingStop();
    }
  };

  const handleMentionSelect = (selectedProfile: Profile) => {
    if (mentionStartPosition === null || !inputRef.current) return;

    const currentContent = getValues('content');
    const cursorPosition = inputRef.current.selectionStart || 0;
    
    const prefix = currentContent.substring(0, mentionStartPosition);
    const suffix = currentContent.substring(cursorPosition);
    
    const mentionText = `@[${selectedProfile.full_name}](${selectedProfile.id}) `;
    const newContent = `${prefix}${mentionText}${suffix}`;
    
    setValue('content', newContent, { shouldDirty: true });
    
    const newCursorPosition = prefix.length + mentionText.length;
    setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);

    setMentionQuery(null);
    setMentionResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prevIndex) => (prevIndex + 1) % mentionResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prevIndex) => (prevIndex - 1 + mentionResults.length) % mentionResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleMentionSelect(mentionResults[mentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        setMentionResults([]);
      }
    }
  };

  const sendMessage = async (
    content: string,
    media_url?: string,
    media_type?: 'image' | 'video' | 'file' | 'gif' | 'profile',
    location_data?: object
  ) => {
    if (!user) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      content,
      media_url,
      media_type,
      location_data,
    });
    sendTypingStop.cancel();
  };

  const onTextSubmit = (data: { content: string }) => {
    if (data.content.trim() === '') return;
    sendMessage(data.content);
    reset();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue('content', getValues('content') + emojiData.emoji);
  };

  const handleGifSelect = (gif: any) => {
    sendMessage(`GIF: ${gif.title}`, gif.images.original.url, 'gif');
    setIsGiphyOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToPreview(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendMessage('Ma position actuelle', undefined, undefined, { latitude, longitude });
      },
      () => toast.error("Position kann nicht abgerufen werden.")
    );
  };

  const handleGallerySelect = (media: { media_url: string; media_type: 'image' | 'video' }) => {
    const file = new File([], media.media_url, { type: `external/${media.media_type}` });
    setFilesToPreview([file]);
    setIsGalleryOpen(false);
  };

  const handleProfileShareSelect = (profileToShare: Profile) => {
    const profileData = {
      id: profileToShare.id,
      full_name: profileToShare.full_name,
      avatar_url: profileToShare.avatar_url,
    };
    sendMessage(JSON.stringify(profileData), undefined, 'profile');
    setIsProfileShareModalOpen(false);
  };

  return (
    <>
      <GiphyPicker isOpen={isGiphyOpen} onClose={() => setIsGiphyOpen(false)} onSelect={handleGifSelect} />
      <GalleryPickerModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelect={handleGallerySelect} />
      <UserSearchModal
        isOpen={isProfileShareModalOpen}
        onClose={() => setIsProfileShareModalOpen(false)}
        onConversationSelect={() => {}}
        onProfileSelect={handleProfileShareSelect}
        mode="shareProfile"
      />
      <MediaSendPreview
        isOpen={filesToPreview.length > 0}
        onClose={() => setFilesToPreview([])}
        files={filesToPreview}
        conversationId={conversationId}
      />

      <div className="relative">
        {mentionQuery !== null && (
          <MentionSuggestions
            profiles={mentionResults}
            onSelect={handleMentionSelect}
            selectedIndex={mentionIndex}
          />
        )}
        <form onSubmit={handleSubmit(onTextSubmit)} className="flex items-center gap-2">
          <Popover className="relative">
            <Popover.Button className="p-2 text-gray-500 hover:text-german-red rounded-full hover:bg-gray-100">
              <Smile />
            </Popover.Button>
            <Popover.Panel className="absolute bottom-full right-0 mb-2 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Popover.Panel>
          </Popover>
          <Popover className="relative">
            <Popover.Button className="p-2 text-gray-500 hover:text-german-red rounded-full hover:bg-gray-100">
              <Paperclip />
            </Popover.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute bottom-full right-0 mb-2 w-56 bg-white shadow-lg rounded-lg border p-2 z-10">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <Paperclip className="w-5 h-5 text-gray-500" /> Fichier
                </button>
                <button type="button" onClick={() => setIsGalleryOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <ImageIcon className="w-5 h-5 text-gray-500" /> Galerie
                </button>
                <button type="button" onClick={() => setIsGiphyOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <Gift className="w-5 h-5 text-gray-500" /> GIF
                </button>
                <button type="button" onClick={handleShareLocation} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <MapPin className="w-5 h-5 text-gray-500" /> Localisation
                </button>
                <button type="button" onClick={() => setIsProfileShareModalOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <UserIcon className="w-5 h-5 text-gray-500" /> Partager un profil
                </button>
              </Popover.Panel>
            </Transition>
          </Popover>
          <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*" />
          <input
            {...register('content')}
            ref={(e) => {
              (register('content') as any).ref(e);
              (inputRef as any).current = e;
            }}
            type="text"
            placeholder={t('chat.message_placeholder')}
            autoComplete="off"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-100 border-transparent rounded-full px-4 py-2 focus:bg-white focus:border-gray-300"
          />
          <button type="submit" className="p-3 bg-german-red text-white rounded-full hover:bg-red-700">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageInput;
