import { siteConfig } from './config';
import fs from 'fs';
import path from 'path';
import { logWarning } from './error-handling';

export const AUDIO_CONFIG = {
  // Audio file directory
  audioDir: path.join(process.cwd(), 'public/vo'),

  // Get actual file size for a given audio file
  getFileSize: (audioFile: string): number => {
    if (!audioFile) return 0;

    try {
      const filePath = path.join(process.cwd(), 'public', audioFile);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return stats.size;
      }
    } catch (error) {
      logWarning(`Could not get file size for ${audioFile}`, {
        component: 'audio-config',
        action: 'get_file_size',
        data: { audioFile, error: error?.toString() },
      });
    }

    return 0;
  },

  // Podcast configuration
  podcast: {
    title: `${siteConfig.title} - Audio Chapters`,
    description: `Audio versions of chapters from "${siteConfig.title}" - a practical guide to bridging the gap between creative work and real strategy. Perfect for designers, students, and teams who want to learn on the go.`,
    author: siteConfig.author,
    email: siteConfig.email,
    language: 'en-US',
    category: 'Education',
    subcategory: 'Design',
    explicit: false,
    type: 'episodic',
    updatePeriod: 'weekly',
    updateFrequency: 1,
  },
} as const;
