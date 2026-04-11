import {
  ChatService,
  createRequestContainer,
  initContainer,
} from "@weekly-cal/api";
import type { UIMessage } from "ai";
import { config } from "dotenv";
import express from "express";
config();

// Initialize DI container (validates env vars at startup)
initContainer();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Chat endpoint with streaming
app.post("/api/chat", async (req, res) => {
  const { messages, tools } = req.body as {
    messages: UIMessage[];
    tools?: any;
  };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  // For dev, use a test user (integrate real auth later)
  const userId = process.env.TEST_USER_ID || "test-user";

  const container = createRequestContainer(userId);
  const chatService = container.get(ChatService);

  const result = await chatService.streamChat(messages, tools);
  return result.pipeUIMessageStreamToResponse(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
});

export default app;
