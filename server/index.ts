import express from "express";
import { createServer as createViteServer } from "vite";
import statsRouter from "./routes/stats.js";
import roomsRouter from "./routes/rooms.js";
import tenantsRouter from "./routes/tenants.js";
import invoicesRouter from "./routes/invoices.js";
import parcelsRouter from "./routes/parcels.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.use("/api/stats", statsRouter);
  app.use("/api/rooms", roomsRouter);
  app.use("/api/tenants", tenantsRouter);
  app.use("/api/invoices", invoicesRouter);
  app.use("/api/parcels", parcelsRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, you would serve static files here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
