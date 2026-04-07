import { config } from "dotenv";
import express from "express";
import { streamChat } from "./services/chat.service";
config();

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages, tools } = req.body;

  const result = await streamChat(messages, tools);
  return result.pipeUIMessageStreamToResponse(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
