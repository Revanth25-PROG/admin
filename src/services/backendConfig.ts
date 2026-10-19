/**
 * STUDYVERSE Universal Backend Configuration Service
 * Supports:
 * 1. Custom REST API (Node.js / Express / Python / Go on Render, Railway, AWS, Fly.io)
 * 2. Supabase PostgreSQL
 * 3. Offline-First Local Demo Mode (fallback)
 */

export type BackendType = 'custom_api' | 'supabase' | 'local_demo';

export interface BackendConnectionConfig {
  backendType: BackendType;
  backendUrl: string;
  apiKey?: string;
  isConnected: boolean;
  lastPingMs?: number;
  lastCheckedAt?: string;
  errorMessage?: string;
}

const BACKEND_CONFIG_KEY = 'STUDYVERSE_BACKEND_CONFIG_V1';

class BackendConfigService {
  private config: BackendConnectionConfig;
  private listeners: Set<(config: BackendConnectionConfig) => void> = new Set();

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): BackendConnectionConfig {
    // 1. Check runtime localStorage override
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(BACKEND_CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.backendUrl === 'string') {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to parse backend config from localStorage', err);
      }
    }

    // 2. Check environment variables
    const customUrl =
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      '';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0) {
      return {
        backendType: 'custom_api',
        backendUrl: customUrl.trim().replace(/\/+$/, ''),
        apiKey: import.meta.env.VITE_API_KEY || '',
        isConnected: false,
      };
    }

    if (
      supabaseUrl &&
      typeof supabaseUrl === 'string' &&
      supabaseUrl.trim().length > 0 &&
      !supabaseUrl.includes('your-project-id')
    ) {
      return {
        backendType: 'supabase',
        backendUrl: supabaseUrl.trim().replace(/\/+$/, ''),
        apiKey: supabaseKey.trim(),
        isConnected: true,
      };
    }

    // Default to user's live Render backend
    const defaultRenderUrl = 'https://admin-feq0.onrender.com';
    return {
      backendType: 'custom_api',
      backendUrl: (customUrl && customUrl.trim().length > 0) ? customUrl.trim().replace(/\/+$/, '') : defaultRenderUrl,
      apiKey: import.meta.env.VITE_API_KEY || '',
      isConnected: true,
    };
  }

  public getConfig(): BackendConnectionConfig {
    return { ...this.config };
  }

  public subscribe(listener: (config: BackendConnectionConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l({ ...this.config });
      } catch (err) {
        console.error('Error notifying backend config listener', err);
      }
    });
  }

  public saveConfig(newConfig: Partial<BackendConnectionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      backendUrl: (newConfig.backendUrl !== undefined ? newConfig.backendUrl : this.config.backendUrl).trim().replace(/\/+$/, ''),
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(BACKEND_CONFIG_KEY, JSON.stringify(this.config));
      } catch (err) {
        console.error('Failed to save backend config to localStorage', err);
      }
    }
    this.notify();
  }

  public resetToDefault(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(BACKEND_CONFIG_KEY);
    }
    this.config = this.loadConfig();
    this.notify();
  }

  /**
   * Performs a live health check ping against the provided or active backend URL
   */
  public async testConnection(
    overrideUrl?: string,
    overrideType?: BackendType,
    overrideKey?: string
  ): Promise<{ success: boolean; latencyMs: number; message: string; details?: any }> {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : this.config.backendUrl).trim().replace(/\/+$/, '');
    const targetType = overrideType || this.config.backendType;
    const targetKey = overrideKey !== undefined ? overrideKey : this.config.apiKey;

    if (!targetUrl) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No backend URL provided.',
      };
    }

    const startTime = performance.now();

    try {
      if (targetType === 'supabase') {
        // Test Supabase Rest endpoint
        const testEndpoint = `${targetUrl}/rest/v1/`;
        const headers: Record<string, string> = {
          apikey: targetKey || '',
          Authorization: `Bearer ${targetKey || ''}`,
        };

        const res = await fetch(testEndpoint, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(8000),
        });

        const latencyMs = Math.round(performance.now() - startTime);

        if (res.ok || res.status === 401 || res.status === 404 || res.status === 200) {
          this.saveConfig({
            isConnected: true,
            lastPingMs: latencyMs,
            lastCheckedAt: new Date().toISOString(),
            errorMessage: undefined,
          });

          return {
            success: true,
            latencyMs,
            message: `Connected successfully to Supabase (${latencyMs}ms)!`,
          };
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } else {
        // Test Custom REST API: Try /health, /api/health, or root /
        const endpointsToTry = [
          `${targetUrl}/api/health`,
          `${targetUrl}/health`,
          `${targetUrl}/`,
        ];

        let lastErr: any = null;
        for (const ep of endpointsToTry) {
          try {
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (targetKey) {
              headers['Authorization'] = `Bearer ${targetKey}`;
            }

            const res = await fetch(ep, {
              method: 'GET',
              headers,
              signal: AbortSignal.timeout(7000),
            });

            const latencyMs = Math.round(performance.now() - startTime);

            if (res.ok) {
              let payload: any = null;
              try {
                payload = await res.json();
              } catch (_) {}

              this.saveConfig({
                isConnected: true,
                lastPingMs: latencyMs,
                lastCheckedAt: new Date().toISOString(),
                errorMessage: undefined,
              });

              return {
                success: true,
                latencyMs,
                message: `Backend reachable at ${ep} (${latencyMs}ms)!`,
                details: payload,
              };
            }
          } catch (e) {
            lastErr = e;
          }
        }

        throw lastErr || new Error('All health endpoints failed to respond.');
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const errMsg = err?.message || 'Failed to connect to backend server. Verify CORS and URL accessibility.';

      this.saveConfig({
        isConnected: false,
        lastPingMs: latencyMs,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: errMsg,
      });

      return {
        success: false,
        latencyMs,
        message: `Connection failed: ${errMsg}`,
      };
    }
  }
}

export const backendConfig = new BackendConfigService();
