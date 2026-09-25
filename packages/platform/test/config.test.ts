import { describe, expect, it } from 'vitest';
import { baseConfig, ConfigError, loadConfig } from '../src/config.ts';

describe('loadConfig', () => {
  it('names the variables that are wrong, never their values', () => {
    const attempt = () =>
      loadConfig(baseConfig, {
        SERVICE_NAME: 'intake',
        PORT: 'not-a-port',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'secret-token',
      });
    expect(attempt).toThrow(ConfigError);
    try {
      attempt();
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toMatch(/PORT/);
      expect(message).toMatch(/OTEL_EXPORTER_OTLP_ENDPOINT/);
      expect(message).not.toMatch(/secret-token|not-a-port/);
    }
  });

  it('applies defaults', () => {
    expect(loadConfig(baseConfig, { SERVICE_NAME: 'intake' })).toMatchObject({
      PORT: 3000,
      SITE_ENV: 'local',
      LOG_LEVEL: 'info',
    });
  });
});
