import {
  ChatService,
  createRequestContainer,
  initContainer,
} from "@weekly-cal/api";
import { config } from "dotenv";
import express from "express";
import { authMiddleware } from "./middleware/auth";
import dataRouter from "./routes";
config();

// Initialize DI container (validates env vars at startup)
initContainer();

const app = express();
app.use(express.json());
app.use(authMiddleware);

app.use("/", dataRouter);

// Chat endpoint with streaming
app.post("/api/chat", async (req, res) => {
  const { messages, tools, system } = req.body as any;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  const container = createRequestContainer(req.userId);
  const chatService = container.get(ChatService);

  const result = await chatService.streamChat(messages, tools, system);
  return result.pipeUIMessageStreamToResponse(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
});

export default app;
