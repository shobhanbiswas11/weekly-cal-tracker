const API_BASE_URL = import.meta.env.VITE_API_URL;
const CHAT_URL = import.meta.env.VITE_CHAT_URL;

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_URL in environment");
}

if (!CHAT_URL) {
  throw new Error("Missing VITE_CHAT_URL in environment");
}

export { API_BASE_URL, CHAT_URL };
