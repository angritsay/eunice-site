-- A demo request asks only for a work email (ADR-0013), so a submission may come
-- without a name.
alter table intake.submissions
  alter column name drop not null;
