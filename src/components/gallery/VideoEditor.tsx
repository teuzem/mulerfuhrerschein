import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import Button from '../ui/Button';

interface MediaItem {
  file: File | null;
  url: string;
  description: string;
  preview: string | null;
}

interface VideoEditorProps {
  mediaItem: MediaItem;
  onSave: (description: string) => void;
  onClose: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ mediaItem, onSave, onClose }) => {
  const [description, setDescription] = useState(mediaItem.description);

  const handleSave = () => {
    onSave(description);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <ReactPlayer url={mediaItem.preview!} controls playing width="100%" height="100%" />
      </div>
      <div>
        <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 mb-1">Video-Beschreibung</label>
        <textarea id="video-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Beschreibung für Ihr Video..."></textarea>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default VideoEditor;
