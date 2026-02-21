import { GoogleGenAI } from "@google/genai";

const BATCHES_API = "/api/proxy/batches";
const TOPICS_API = "/api/proxy/batch";
const CONTENT_API = "/api/proxy/content";
const VIDEO_DETAILS_API = "/api/proxy/video_details";

export interface Batch {
  batch_id: string;
  batch_name: string;
}

export interface Topic {
  topic_id: string;
  topic_name: string;
}

export interface VideoContent {
  title: string;
  video_id: string | null;
  url: string | null;
}

export interface NoteContent {
  title: string;
  file: string;
}

export interface TopicContent {
  videos: VideoContent[];
  notes: NoteContent[];
  rawClasses?: any[];
}

export const apiService = {
  async getBatches(): Promise<Batch[]> {
    try {
      const response = await fetch(BATCHES_API);
      const result = await response.json();
      if (!result || typeof result !== 'object') return [];
      return Object.entries(result).map(([id, name]) => ({
        batch_id: id,
        batch_name: name as string
      }));
    } catch (error) {
      console.error("Error fetching batches:", error);
      return [];
    }
  },

  async getTopics(batchId: string): Promise<Topic[]> {
    try {
      const response = await fetch(`${TOPICS_API}/${batchId}`);
      const result = await response.json();
      if (result && result.topics) {
        return result.topics.map((t: any) => ({
          topic_id: String(t.id),
          topic_name: t.topicName
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching topics:", error);
      throw error; // Throw so the UI can show the error state
    }
  },

  async getContent(batchId: string, topicId: string): Promise<TopicContent> {
    try {
      const response = await fetch(`${CONTENT_API}?batchid=${batchId}&topicid=${topicId}&full=true`);
      const result = await response.json();
      
      // Handle the new structure where everything is in 'classes'
      if (result && result.classes) {
        const videos: VideoContent[] = [];
        const notes: NoteContent[] = [];

        result.classes.forEach((item: any) => {
          if (item.video_url) {
            // It's a video
            const isYoutube = item.video_url.includes('youtube.com') || item.video_url.includes('youtu.be');
            videos.push({
              title: item.title,
              video_id: isYoutube ? null : item.video_url,
              url: isYoutube ? item.video_url : null
            });
          } else if (item.view_url) {
            // It's a PDF
            notes.push({
              title: item.title,
              file: item.view_url
            });
          }
        });

        return { videos, notes, rawClasses: result.classes };
      }

      return {
        videos: result.videos || [],
        notes: result.notes || []
      };
    } catch (error) {
      console.error("Error fetching content:", error);
      return { videos: [], notes: [] };
    }
  },

  async getVideoStream(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(`${VIDEO_DETAILS_API}?name=${videoId}`);
      const result = await response.json();
      return result.status === "success" ? result.stream_url : null;
    } catch (error) {
      console.error("Error fetching video stream:", error);
      return null;
    }
  }
};
