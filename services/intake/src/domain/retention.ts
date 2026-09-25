// How long a submission is kept. The privacy notice states this period; the service
// deletes what is older, so the promise holds without anyone remembering to act on it.

export const MIN_RETENTION_DAYS = 30;
export const MAX_RETENTION_DAYS = 3 * 365;

const DAY_MS = 24 * 60 * 60 * 1000;

export function purgeAfter(receivedAt: Date, retentionDays: number): Date {
  if (!Number.isInteger(retentionDays) || retentionDays < MIN_RETENTION_DAYS || retentionDays > MAX_RETENTION_DAYS) {
    throw new RangeError(
      `Retention must be a whole number of days between ${MIN_RETENTION_DAYS} and ${MAX_RETENTION_DAYS}`,
    );
  }
  return new Date(receivedAt.getTime() + retentionDays * DAY_MS);
}
