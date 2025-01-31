import { Client } from 'modal';

export const modalClient = new Client({
  apiKey: import.meta.env.VITE_MODAL_API_KEY,
  apiSecret: import.meta.env.VITE_MODAL_API_SECRET,
});

export const initializeModal = async () => {
  await modalClient.authenticate();
  return modalClient;
};
