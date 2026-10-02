import { afterEach, expect, test, vi } from 'vitest';
import { createUsageRecorder } from '../src/analytics.js';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
test('local and opted-out tool requests send nothing', async () => {
  const send = vi.fn(); vi.stubGlobal('fetch',send);
  vi.stubEnv('VERCEL_ENV','');
  await createUsageRecorder(false)('evaluation_requested');
  vi.stubEnv('VERCEL_ENV','production');
  await createUsageRecorder(true)('evaluation_completed');
  expect(send).not.toHaveBeenCalled();
});
test('hosted tools count requests with no MCP inputs and fail softly', async () => {
  vi.stubEnv('VERCEL_ENV','production');
  const send=vi.fn().mockResolvedValue({ok:true}); vi.stubGlobal('fetch',send);
  const record=createUsageRecorder(false);
  await record('evaluation_requested'); await record('evaluation_completed');
  const start=JSON.parse(send.mock.calls[0][1].body)[0];
  const done=JSON.parse(send.mock.calls[1][1].body)[0];
  expect(start.sessionId).toBe(done.sessionId);
  expect(new Date(done.occurredAt).getTime()).toBeGreaterThan(new Date(start.occurredAt).getTime());
  expect(Object.keys(done).sort()).toEqual(['app','clientEventId','eventName','occurredAt','pagePath','properties','sessionId','visitorId'].sort());
  expect(done.properties).toEqual({});
  send.mockRejectedValue(new Error('private transport error'));
  await expect(record('result_rendered')).resolves.toBeUndefined();
});
