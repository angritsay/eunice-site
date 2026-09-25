import type { Generated } from 'kysely';

export interface DeliveriesTable {
  event_id: string;
  submission_id: string;
  provider_id: string;
  delivered_at: Date;
  created_at: Generated<Date>;
}

export interface DB {
  'notifier.deliveries': DeliveriesTable;
}
