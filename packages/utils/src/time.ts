/**
 * Time and Anti-Look-Ahead Utilities (PRD Section 10 & 12)
 */

export function nowIso(): string {
  return new Date().toISOString();
}

export function toDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

export function isTimestampValidForAnchor(eventTime: Date, anchorTime: Date): boolean {
  return eventTime.getTime() <= anchorTime.getTime();
}

export function assertNoLookAhead(eventTime: Date, anchorTime: Date, eventName = 'event'): void {
  if (eventTime.getTime() > anchorTime.getTime()) {
    throw new Error(
      `Anti-Look-Ahead violation: ${eventName} timestamp (${eventTime.toISOString()}) is ahead of anchor timestamp (${anchorTime.toISOString()})`
    );
  }
}

export function getDetectionLatencyMs(tMarket: Date, tDetect: Date): number {
  return Math.max(0, tDetect.getTime() - tMarket.getTime());
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
