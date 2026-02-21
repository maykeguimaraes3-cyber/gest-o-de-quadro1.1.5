import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "sync_data.json");

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev mode compatibility
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Load data from file on startup
let store: Record<string, any> = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log("Loaded sync data from file.");
  } catch (e) {
    console.error("Error loading sync data:", e);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error("Error saving sync data:", e);
  }
}

// API Routes
app.get("/api/sync/:cloudId", (req, res) => {
  const { cloudId } = req.params;
  console.log(`[GET] Syncing data for ID: ${cloudId}`);
  
  if (store[cloudId]) {
    res.json(store[cloudId]);
  } else {
    res.status(404).json({ error: "Cloud ID not found", users: [], sectors: {} });
  }
});

app.post("/api/sync/:cloudId", (req, res) => {
  const { cloudId } = req.params;
  const data = req.body;
  console.log(`[POST] Saving data for ID: ${cloudId}`);
  
  // Basic merge: ensure we don't lose data if multiple devices push
  store[cloudId] = {
    ...store[cloudId],
    ...data,
    lastUpdated: new Date().toISOString()
  };
  
  saveStore();
  res.json({ success: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  console.log("Starting server...");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite in development mode...");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          host: '0.0.0.0',
          port: 3000
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } else {
      console.log("Starting in production mode...");
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> Server is listening on port ${PORT}`);
      console.log(`>>> Access the app at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
