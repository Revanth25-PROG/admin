import { backendConfig } from './backendConfig';
import { StudyVerseState } from '../types';

/**
 * Universal REST API Client for STUDYVERSE
 * Handles bidirectional state synchronization with any backend deployment link
 */
class ApiClient {
  private getHeaders(): Record<string, string> {
    const config = backendConfig.getConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    return headers;
  }

  private getBaseUrl(): string {
    return backendConfig.getConfig().backendUrl.replace(/\/+$/, '');
  }

  public isAvailable(): boolean {
    const config = backendConfig.getConfig();
    return Boolean(config.backendUrl && config.backendType === 'custom_api');
  }

  /**
   * Health Check
   */
  public async checkHealth(): Promise<{ status: string; uptime?: number; timestamp?: string }> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) throw new Error('No backend URL configured');

    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Health check returned HTTP ${res.status}`);
    }

    return res.json();
  }

  /**
   * Fetch full state from backend
   */
  public async fetchFullState(): Promise<Partial<StudyVerseState>> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) throw new Error('No backend URL configured');

    const res = await fetch(`${baseUrl}/api/state`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch state from backend: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.state || data;
  }

  /**
   * Push full state to backend (Seed / Backup / Full Sync)
   */
  public async pushFullState(state: StudyVerseState): Promise<{ success: boolean; message: string; timestamp?: string }> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) throw new Error('No backend URL configured');

    const res = await fetch(`${baseUrl}/api/state/sync`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ state }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend sync failed (HTTP ${res.status}): ${errText || res.statusText}`);
    }

    return res.json();
  }

  /**
   * Sync a single collection item to backend
   */
  public async syncEntity(
    collection: string,
    action: 'upsert' | 'delete',
    payload: any
  ): Promise<any> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return null;

    try {
      const url = `${baseUrl}/api/${collection}`;
      const res = await fetch(url, {
        method: action === 'delete' ? 'DELETE' : 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`[ApiClient] ${collection} ${action} returned ${res.status}`);
        return null;
      }

      return res.json();
    } catch (err) {
      console.warn(`[ApiClient] Failed to sync ${collection}`, err);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
