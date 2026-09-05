import { describe, it, expect } from 'vitest';
import { assertNoLookAhead, isTimestampValidForAnchor } from '@meme-coin/utils';

describe('Anti-Look-Ahead Bias Enforcement Tests (PRD Section 10 & 12)', () => {
  const T0 = new Date('2026-09-06T00:00:00.000Z');

  it('permits events occurring prior to or exactly at T0', () => {
    const pastEvent = new Date('2026-09-05T23:59:59.000Z');
    const exactEvent = new Date('2026-09-06T00:00:00.000Z');

    expect(isTimestampValidForAnchor(pastEvent, T0)).toBe(true);
    expect(isTimestampValidForAnchor(exactEvent, T0)).toBe(true);
    expect(() => assertNoLookAhead(pastEvent, T0)).not.toThrow();
    expect(() => assertNoLookAhead(exactEvent, T0)).not.toThrow();
  });

  it('strictly rejects any future event after T0 (Anti-Look-Ahead Invariant)', () => {
    const futureEvent = new Date('2026-09-06T00:00:00.001Z');
    const futureTrade = new Date('2026-09-06T01:00:00.000Z');

    expect(isTimestampValidForAnchor(futureEvent, T0)).toBe(false);
    expect(isTimestampValidForAnchor(futureTrade, T0)).toBe(false);

    expect(() => assertNoLookAhead(futureEvent, T0, 'trade')).toThrowError(/Anti-Look-Ahead violation/);
    expect(() => assertNoLookAhead(futureTrade, T0, 'liquidity_event')).toThrowError(/Anti-Look-Ahead violation/);
  });
});
