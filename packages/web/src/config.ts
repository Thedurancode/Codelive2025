// Expected to be defined in index.html
declare global {
  interface Window {
    SRCBOOK_CONFIG: {
      api: {
        host: string;
        origin: string;
        websocket: string;
      };
    };
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2150';

// Extract host and port from API_URL
const urlMatch = API_URL.match(/^https?:\/\/([^/]+)/);
const hostAndPort = urlMatch ? urlMatch[1] : 'localhost:2150';

const config = {
  api: {
    host: API_URL,
    origin: API_URL,
    websocket: `ws://${hostAndPort}/websocket`,
  },
};

export default config;
