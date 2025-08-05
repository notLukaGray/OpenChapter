'use client';

import AudioPlayer from './AudioPlayer';

interface AudioPlayerWrapperProps {
  src?: string;
  chapterTitle?: string;
}

export default function AudioPlayerWrapper({
  src,
  chapterTitle,
}: AudioPlayerWrapperProps) {
  return <AudioPlayer src={src} chapterTitle={chapterTitle} />;
}
