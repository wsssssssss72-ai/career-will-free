import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for Batches API
  app.get("/api/proxy/batches", async (req, res) => {
    try {
      const response = await fetch("https://cw-ut-scammer-52a64964eb2b.herokuapp.com/api/batches");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error (batches):", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });

  // Proxy for Topics API
  app.get("/api/proxy/batch/:id", async (req, res) => {
    try {
      const response = await fetch(`https://cw-api-website.vercel.app/batch/${req.params.id}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error (topics):", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  // Proxy for Content API
  app.get("/api/proxy/content", async (req, res) => {
    const { batchid, topicid, full } = req.query;
    try {
      const url = `https://cw-api-website.vercel.app/batch?batchid=${batchid}&topicid=${topicid}&full=${full}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }

      // Try fallback if primary fails
      const fallbackUrl = `https://cw-api-website.vercel.app/batch/${batchid}/${topicid}`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return res.json(data);
      }

      res.status(response.status).json({ error: "Failed to fetch content from both primary and fallback" });
    } catch (error) {
      console.error("Proxy error (content):", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Proxy for Video Details API
  app.get("/api/proxy/video_details", async (req, res) => {
    const { name } = req.query;
    try {
      const response = await fetch(`https://cw-vid-virid.vercel.app/get_video_details?name=${name}`);
      const result = await response.json();
      
      // Extract nested file_url from the new example structure
      // { "status": true, "data": { "link": { "file_url": "..." } } }
      if (result.status && result.data?.link?.file_url) {
        return res.json({ 
          status: "success", 
          stream_url: result.data.link.file_url 
        });
      }
      
      // Fallback for old structure if any
      if (result.status === "success" || result.stream_url) {
        return res.json(result);
      }

      res.status(404).json({ error: "Video stream not found" });
    } catch (error) {
      console.error("Proxy error (video):", error);
      res.status(500).json({ error: "Failed to fetch video details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
