import fs from 'fs';
import path from 'path';
import { INITIAL_SAMPLE_DATA } from '../src/services/sampleData';

async function main() {
  const backendUrl = process.env.BACKEND_URL || 'https://admin-feq0.onrender.com';
  console.log(`[Seed Script] Target Backend: ${backendUrl}`);

  // 1. Write server/data/initialState.json so the backend server has full seed state permanently
  const serverDataDir = path.resolve(process.cwd(), 'server', 'data');
  if (!fs.existsSync(serverDataDir)) {
    fs.mkdirSync(serverDataDir, { recursive: true });
  }

  const initialStatePath = path.join(serverDataDir, 'initialState.json');
  fs.writeFileSync(initialStatePath, JSON.stringify(INITIAL_SAMPLE_DATA, null, 2), 'utf-8');
  console.log(`[Seed Script] Saved initialState.json (${(fs.statSync(initialStatePath).size / 1024).toFixed(1)} KB)`);

  // 2. POST to remote backend /api/state/sync
  console.log(`[Seed Script] Syncing state to ${backendUrl}/api/state/sync...`);
  try {
    const res = await fetch(`${backendUrl}/api/state/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: INITIAL_SAMPLE_DATA }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Seed Script] Remote sync failed with HTTP ${res.status}:`, err);
      process.exit(1);
    }

    const data = await res.json();
    console.log('[Seed Script] Remote sync SUCCESS:', data);
  } catch (err) {
    console.error('[Seed Script] Network error syncing to remote backend:', err);
    process.exit(1);
  }
}

main();
