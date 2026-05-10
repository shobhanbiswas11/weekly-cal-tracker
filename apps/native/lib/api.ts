const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment");
}

if (!CHAT_URL) {
  throw new Error("Missing EXPO_PUBLIC_CHAT_ENDPOINT_URL in environment");
}

export { API_BASE_URL, CHAT_URL };
