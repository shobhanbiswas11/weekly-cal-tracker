import express from "express";

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
  // Handle chat request
  res.json({ message: "Hello from the backend!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
