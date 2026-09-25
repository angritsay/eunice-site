// A form submission as the business sees it: who wrote, to which desk, about what,
// and where on the site they were when they did. No framework or wire-format types:
// the application layer maps requests into this, so the model outlives both.

export interface Contact {
  readonly name: string;
  readonly email: string;
  readonly company?: string;
}

export interface EntryPoint {
  readonly page: string;
  readonly placement: string;
  readonly audience?: string | undefined;
}

export interface Attribution {
  readonly referrer?: string | undefined;
  readonly utm?: Readonly<Record<string, string | undefined>> | undefined;
}

export interface NewSubmission {
  readonly variant: string;
  readonly desk: string;
  readonly contact: Contact;
  /** Any fields a variant asks beyond name, email, company and message. */
  readonly details: Readonly<Record<string, string>>;
  readonly message?: string;
  readonly entry: EntryPoint;
  readonly attribution?: Attribution;
}

/** The fields every variant shares; everything else a variant asks is a detail. */
const CONTACT_FIELDS = new Set(['name', 'email', 'company', 'message']);

/** Splits a variant's flat field values into the contact, the message and the details. */
export function toSubmission(input: {
  variant: string;
  desk: string;
  fields: Readonly<Record<string, string | undefined>>;
  entry: EntryPoint;
  attribution?: Attribution;
}): NewSubmission {
  const { name, email, company, message } = input.fields;
  if (!name || !email) throw new Error('A submission needs a name and an email');
  const details = Object.fromEntries(
    Object.entries(input.fields).filter((e): e is [string, string] => !CONTACT_FIELDS.has(e[0]) && e[1] !== undefined),
  );
  return {
    variant: input.variant,
    desk: input.desk,
    contact: { name, email, ...(company ? { company } : {}) },
    details,
    ...(message ? { message } : {}),
    entry: input.entry,
    ...(input.attribution ? { attribution: input.attribution } : {}),
  };
}
