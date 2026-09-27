import { describe, expect, it } from 'vitest';
import { DeskLog } from './desk-log';

describe('DeskLog', () => {
  it('keeps the newest entry first and hands the outcome back', () => {
    const log = new DeskLog();
    const first = { ok: true, message: 'one' } as const;
    expect(log.record('A', first)).toBe(first);
    log.record('B', { ok: false, error: { code: 'X', message: 'two' } });

    expect(log.entries().map(e => e.action)).toEqual(['B', 'A']);
  });

  it('keeps only the last 20', () => {
    const log = new DeskLog();
    for (let i = 1; i <= 25; i++) log.record(`#${i}`, { ok: true, message: '' });

    expect(log.entries()).toHaveLength(20);
    expect(log.entries()[0].action).toBe('#25');
    expect(log.entries()[19].action).toBe('#6');
  });
});
