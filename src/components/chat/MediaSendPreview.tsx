import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Film } from 'lucide-react';

interface MediaSendPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  conversationId: string;
}

const MediaSendPreview: React.FC<MediaSendPreviewProps> = ({ isOpen, onClose, files, conversationId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!user || files.length === 0) return;
    setIsSending(true);

    try {
      const messagesToInsert = [];

      for (const file of files) {
        let media_url: string;
        let media_type: 'image' | 'video' = file.type.startsWith('image') ? 'image' : 'video';

        if (file.type.startsWith('external')) {
          media_url = file.name; // The name is the URL for external files
        } else {
          const filePath = `${user.id}/${conversationId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('chat_media').upload(filePath, file);
          if (uploadError) throw new Error(`Échec de l'upload pour ${file.name}`);
          const { data: urlData } = supabase.storage.from('chat_media').getPublicUrl(filePath);
          media_url = urlData.publicUrl;
        }

        messagesToInsert.push({
          conversation_id: conversationId,
          user_id: user.id,
          content: caption,
          media_url: media_url,
          media_type: media_type,
        });
      }

      const { error: insertError } = await supabase.from('messages').insert(messagesToInsert);
      if (insertError) throw insertError;

      toast.success('Medien gesendet!');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aperçu et envoi de médias">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-100 rounded-lg">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square bg-gray-200 rounded-md overflow-hidden">
              {file.type.startsWith('image') ? (
                <img src={file.type.startsWith('external') ? file.name : URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-gray-500" /></div>
              )}
            </div>
          ))}
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t('chat.caption_placeholder')}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSend} isLoading={isSending}>Envoyer</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MediaSendPreview;
