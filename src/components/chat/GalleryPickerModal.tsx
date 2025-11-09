import React, { useState, useEffect } from 'react';
import { supabase, GalleryMedia } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Image as ImageIcon, Video } from 'lucide-react';

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { media_url: string; media_type: 'image' | 'video' }) => void;
}

const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      const fetchMedia = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('gallery_media')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true);
        
        if (error) console.error(error);
        else setMedia(data as any);
        setLoading(false);
      };
      fetchMedia();
    }
  }, [isOpen, user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medien auswählen">
      <div className="h-96 overflow-y-auto">
        {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
          <div className="grid grid-cols-3 gap-2">
            {media.map(item => (
              <div key={item.id} className="relative aspect-square cursor-pointer group" onClick={() => onSelect(item)}>
                <img src={item.media_type === 'image' ? item.media_url : item.thumbnail_url || item.media_url} className="w-full h-full object-cover rounded-md" />
                {item.media_type === 'video' && <Video className="absolute bottom-1 right-1 w-5 h-5 text-white" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GalleryPickerModal;
