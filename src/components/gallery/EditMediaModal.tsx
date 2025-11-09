import React from 'react';
import Modal from '../ui/Modal';
import AdvancedImageEditor from './AdvancedImageEditor';

interface MediaItem {
  file: File | null;
  url: string;
  preview: string | null;
  mediaType: 'image' | 'video';
}

interface EditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem;
  onSave: (editedItem: { file?: File }) => void;
}

const EditMediaModal: React.FC<EditMediaModalProps> = ({ isOpen, onClose, mediaItem, onSave }) => {
  const isVideo = mediaItem.mediaType === 'video';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isVideo ? 'Video-Vorschau' : 'Bild-Editor'}>
      {isVideo ? (
        <div className="text-center p-4">
            <p>Video-Bearbeitung ist derzeit nicht verfügbar.</p>
        </div>
      ) : (
        mediaItem.preview && (
          <AdvancedImageEditor
            imageSrc={mediaItem.preview}
            onSave={(file) => onSave({ file })}
            onClose={onClose}
          />
        )
      )}
    </Modal>
  );
};

export default EditMediaModal;
