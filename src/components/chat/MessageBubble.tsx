import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/lazy';
import { Download, MapPin } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import SharedProfileCard from './SharedProfileCard';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'file' | 'gif' | 'profile';
  location_data?: { latitude: number; longitude: number };
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onSwitchConversation: (conversationId: string) => void;
}

const renderContentWithMentions = (text: string) => {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (index % 3 === 1) { // This is the name part
      const userId = parts[index + 1];
      return (
        <Link key={index} to={`/clients/${userId}`} className="font-semibold text-blue-300 hover:underline bg-blue-500/20 px-1 py-0.5 rounded">
          @{part}
        </Link>
      );
    }
    if (index % 3 === 2) { // This is the ID part, we skip it
      return null;
    }
    return part; // This is a regular text part
  }).filter(Boolean);
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, onSwitchConversation }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const alignment = isCurrentUser ? 'items-end' : 'items-start';
  const bubbleColor = isCurrentUser ? 'bg-german-red text-white' : 'bg-gray-200 text-gray-800';
  const mediaUrl = message.media_url;

  const renderContent = () => {
    const hasCaption = message.content && message.content.trim() !== '';

    const mediaAndCaption = (mediaElement: React.ReactNode) => (
      <div className="flex flex-col gap-1">
        {mediaElement}
        {hasCaption && <p className="text-sm pt-1">{renderContentWithMentions(message.content)}</p>}
      </div>
    );

    if (mediaUrl) {
      switch (message.media_type) {
        case 'image':
          return mediaAndCaption(
            <>
              <ImageLightbox isOpen={isLightboxOpen} src={mediaUrl} onClose={() => setIsLightboxOpen(false)} />
              <img src={mediaUrl} alt="Contenu partagé" className="rounded-lg max-w-xs cursor-pointer" onClick={() => setIsLightboxOpen(true)} />
            </>
          );
        case 'video':
          return mediaAndCaption(
            <div className="w-64">
              <div className="aspect-video rounded-lg overflow-hidden">
                <ReactPlayer url={mediaUrl} controls width="100%" height="100%" />
              </div>
            </div>
          );
        case 'gif':
          return mediaAndCaption(
            <img src={mediaUrl} alt="GIF" className="rounded-lg max-w-xs" />
          );
        default: // file
          return (
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-german-red hover:bg-gray-200">
              <Download className="w-5 h-5" />
              <span>{hasCaption ? message.content : 'Fichier partagé'}</span>
            </a>
          );
      }
    }
    if (message.location_data) {
      const { latitude, longitude } = message.location_data;
      return (
        <a href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-german-red hover:bg-gray-200">
          <MapPin className="w-5 h-5" />
          <span>Position partagée</span>
        </a>
      );
    }
    if (message.media_type === 'profile') {
      try {
        const profileData = JSON.parse(message.content);
        return <SharedProfileCard profile={profileData} onSwitchConversation={onSwitchConversation} />;
      } catch (e) {
        return <p className="text-red-400">Erreur: Impossible d'afficher le profil partagé.</p>;
      }
    }
    return <p>{renderContentWithMentions(message.content)}</p>;
  };

  return (
    <div className={`flex flex-col ${alignment}`}>
      <div className={`px-4 py-2 rounded-2xl max-w-lg ${bubbleColor} ${message.media_type === 'profile' ? 'bg-transparent p-0 text-inherit' : ''}`}>
        {renderContent()}
      </div>
      <p className="text-xs text-gray-400 mt-1 px-1">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  );
};

export default MessageBubble;
