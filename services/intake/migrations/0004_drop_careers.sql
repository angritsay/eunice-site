-- Job applications are no longer taken by the site: each role links to its own
-- application form. Every submission is a lead now, so the queue it was routed to and
-- the role it applied for are gone.
alter table intake.submissions
  drop column queue,
  drop column entry_role;
