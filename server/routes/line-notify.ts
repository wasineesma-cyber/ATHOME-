import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { token, message } = req.body;
    if (!token) {
      return res.status(400).json({ error: "LINE Notify token is required" });
    }

    const params = new URLSearchParams({ message });
    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send LINE notification" });
  }
});

export default router;
