import React, { useState } from 'react';
import { GalleryMedia } from '../../lib/supabase';
import VideoCard from './VideoCard';

interface VideoFeedProps {
  videos: GalleryMedia[];
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos.length > 0 ? videos[0].id : null);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative h-[calc(100vh-12rem)] overflow-y-scroll snap-y snap-mandatory rounded-2xl shadow-2xl bg-black">
        {videos.map((video) => (
          <div key={video.id} id={`video-${video.id}`} className="h-full w-full snap-start flex items-center justify-center relative">
            <VideoCard
              video={video}
              isActive={activeVideoId === video.id}
              setActiveVideoId={setActiveVideoId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;
