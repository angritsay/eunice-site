// A submission, as the notification needs it. Mapped from the event by the application
// layer, so the wording of an email does not depend on the wire format.

export interface Lead {
  readonly submissionId: string;
  readonly desk: string;
  readonly queue: 'leads' | 'careers';
  readonly receivedAt: Date;
  readonly contact: { readonly name: string; readonly email: string; readonly company?: string | undefined };
  readonly details: Readonly<Record<string, string>>;
  readonly message?: string | undefined;
  readonly entry: {
    readonly page: string;
    readonly placement: string;
    readonly audience?: string | undefined;
    readonly role?: string | undefined;
  };
  readonly attribution?:
    | {
        readonly referrer?: string | undefined;
        readonly utm?: Readonly<Record<string, string | undefined>> | undefined;
      }
    | undefined;
}
