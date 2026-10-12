# Voice check

A one-page questionnaire that calibrates [the tone of voice guide](../tone-of-voice.md)
against Yi's own judgement: eleven real lines from the site, each with two or three
alternatives written in a different voice, then four 1–5 scales and five open questions.

- `voice-check.html` is the page. Publish it as a claude.ai Artifact with the `db`
  capability (`{"db": {}}`); answers save to the document `responses/yi` as she goes.
- When the answers are in, read `responses/yi` and save it here as `answers-yi.json`.
  The `choice` of each item is the index of the option picked, in the order the page
  lists them (0 is always the line as it is on the site today).
- Then rewrite `docs/brand/tone-of-voice.md` from the answers, and update the skills
  and `CLAUDE.md` where the guide's rules change.
