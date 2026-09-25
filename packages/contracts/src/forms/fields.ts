// The building blocks of every form: how a field is shown and how it is validated,
// defined once. The site renders from the display half; the intake service validates
// with the schema half. They cannot disagree because they are the same object.
import { z } from 'zod';

/** One line of text. CR and LF are refused: these values end up in email headers. */
export const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\r\n]*$/, 'must be a single line');

export const multiLine = (max: number) => z.string().trim().min(1).max(max);

export type FieldKind = 'text' | 'email' | 'url' | 'textarea' | 'select';

export interface FieldSpec {
  /** The key in the submitted `fields` object. */
  readonly name: string;
  readonly label: string;
  readonly kind: FieldKind;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly autocomplete?: string;
  /** For `select`: the values offered, in order. */
  readonly options?: readonly string[];
  /** Validates a present, non-empty value. `required` decides whether it may be absent. */
  readonly schema: z.ZodType<string>;
  /** Spans both columns of the form grid. */
  readonly wide?: boolean;
}

export const field = (spec: FieldSpec): FieldSpec => spec;

/** The fields every variant starts from. */
export const common = {
  name: field({
    name: 'name',
    label: 'Name',
    kind: 'text',
    required: true,
    autocomplete: 'name',
    schema: singleLine(120),
  }),
  email: field({
    name: 'email',
    label: 'Work email',
    kind: 'email',
    required: true,
    autocomplete: 'email',
    schema: z.email().max(254),
  }),
  /** Not asked today: kept for a form that needs the firm up front. */
  company: field({
    name: 'company',
    label: 'Firm',
    kind: 'text',
    required: false,
    autocomplete: 'organization',
    wide: true,
    schema: singleLine(160),
  }),
};

export const message = (label: string, placeholder: string, required = false) =>
  field({ name: 'message', label, kind: 'textarea', required, placeholder, wide: true, schema: multiLine(4000) });
