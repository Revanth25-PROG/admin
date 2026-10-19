import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'studyverse-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read DB
function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[DB Read Error]', err);
  }
  return {
    profile: null,
    subjects: [],
    topics: [],
    subtopics: [],
    resources: [],
    tasks: [],
    mockTests: [],
    testAttempts: [],
    mistakeBook: [],
    bankQuestions: [],
    revisions: [],
    calendarEvents: [],
    lastSyncedAt: new Date().toISOString(),
  };
}

// Helper to write DB atomically
function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('[DB Write Error]', err);
    return false;
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ---------------------------------------------------------------------------
// 1. HEALTH CHECK ENDPOINTS
// ---------------------------------------------------------------------------
const healthPayload = () => ({
  status: 'ok',
  service: 'STUDYVERSE Backend API',
  version: '2.0.0',
  uptimeSeconds: Math.round(process.uptime()),
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'production',
});

app.get('/', (req, res) => {
  res.json(healthPayload());
});

app.get('/health', (req, res) => {
  res.json(healthPayload());
});

app.get('/api/health', (req, res) => {
  res.json(healthPayload());
});

// ---------------------------------------------------------------------------
// 2. FULL STATE SYNCHRONIZATION ENDPOINTS
// ---------------------------------------------------------------------------
app.get('/api/state', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    state: db,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/state/sync', (req, res) => {
  const { state } = req.body;
  if (!state || typeof state !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid state payload provided.' });
  }

  const existing = readDb();
  const merged = {
    ...existing,
    ...state,
    lastSyncedAt: new Date().toISOString(),
  };

  const written = writeDb(merged);
  if (!written) {
    return res.status(500).json({ success: false, error: 'Failed to persist state to disk.' });
  }

  res.json({
    success: true,
    message: 'Full state synchronized successfully!',
    timestamp: merged.lastSyncedAt,
    entityCounts: {
      subjects: merged.subjects?.length || 0,
      topics: merged.topics?.length || 0,
      tasks: merged.tasks?.length || 0,
      mockTests: merged.mockTests?.length || 0,
      testAttempts: merged.testAttempts?.length || 0,
      mistakeBook: merged.mistakeBook?.length || 0,
      bankQuestions: merged.bankQuestions?.length || 0,
    },
  });
});

// ---------------------------------------------------------------------------
// 3. GRANULAR COLLECTION REST ENDPOINTS
// ---------------------------------------------------------------------------
const collections = [
  'subjects',
  'topics',
  'subtopics',
  'resources',
  'tasks',
  'mockTests',
  'testAttempts',
  'mistakeBook',
  'bankQuestions',
  'revisions',
  'calendarEvents',
];

collections.forEach((col) => {
  // GET /api/:collection
  app.get(`/api/${col}`, (req, res) => {
    const db = readDb();
    res.json({
      success: true,
      data: db[col] || [],
    });
  });

  // POST /api/:collection (upsert item or list)
  app.post(`/api/${col}`, (req, res) => {
    const payload = req.body;
    const db = readDb();
    const list = db[col] || [];

    if (Array.isArray(payload)) {
      // Bulk upsert
      const idMap = new Map(list.map((item) => [item.id, item]));
      payload.forEach((item) => {
        if (item.id) idMap.set(item.id, item);
      });
      db[col] = Array.from(idMap.values());
    } else if (payload && payload.id) {
      // Single upsert
      const idx = list.findIndex((item) => item.id === payload.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...payload };
      } else {
        list.unshift(payload);
      }
      db[col] = list;
    } else {
      return res.status(400).json({ success: false, error: 'Item must have an id' });
    }

    db.lastSyncedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, count: db[col].length });
  });

  // DELETE /api/:collection/:id
  app.delete(`/api/${col}/:id`, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    if (db[col]) {
      db[col] = db[col].filter((item) => item.id !== id);
      db.lastSyncedAt = new Date().toISOString();
      writeDb(db);
    }
    res.json({ success: true, deletedId: id });
  });
});

// Profile endpoints
app.get('/api/profile', (req, res) => {
  const db = readDb();
  res.json({ success: true, profile: db.profile });
});

app.post('/api/profile', (req, res) => {
  const db = readDb();
  db.profile = { ...(db.profile || {}), ...req.body };
  db.lastSyncedAt = new Date().toISOString();
  writeDb(db);
  res.json({ success: true, profile: db.profile });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 STUDYVERSE Backend API running on port ${PORT}`);
  console.log(`📡 Local Health: http://localhost:${PORT}/api/health`);
  console.log(`💾 Database Storage: ${DB_FILE}`);
  console.log(`=======================================================`);
});
