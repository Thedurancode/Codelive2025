import axios from 'axios';

const PEXELS_API_KEY = '0CxtcsDewAjBhvKDosQiQ49dWIp9q5YPee1J9ojh45j5eCHM1zINWhGg';

export async function getPexelsImage(query: string) {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        per_page: 1
      },
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });
    
    return response.data.photos[0]?.src.medium || null;
  } catch (error) {
    console.error('Error fetching Pexels image:', error);
    return null;
  }
}

export async function getPexelsVideo(query: string) {
  try {
    const response = await axios.get('https://api.pexels.com/videos/search', {
      params: {
        query,
        per_page: 1
      },
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });
    
    return response.data.videos[0]?.video_files[0]?.link || null;
  } catch (error) {
    console.error('Error fetching Pexels video:', error);
    return null;
  }
}
