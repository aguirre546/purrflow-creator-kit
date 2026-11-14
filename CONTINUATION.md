# PurrFlow / Mochi continuation

Updated November 14, 2026. This repository preserves two related versions by Victor Aguirre:

- The Creator Kit at the repository root: browser-based creation, captions, calendar and export. Run npm test and npm start. The missing dist and test folders were published on this date.
- PurrFlow_Studio_Automation_Source.zip: the earlier Node/FFmpeg Mochi campaign queue, caption renderer, notification outbox, isolated tests and inactive n8n workflow templates. Extract into a separate directory and follow its README. This is unfinished automation source, not a ready hosted publisher.

The original automation's runtime campaign data, worker locks, video uploads, environment secrets and OAuth tokens are excluded. n8n credential references are placeholders: select your own authorized credential after import. Do not activate the unauthenticated private-upload form as a public uploader.

Current verification: Creator Kit 22 local tests pass; original automation 31 local tests pass with its installed FFmpeg and local networking permitted. The initial restricted run had two local HTTP connection permission errors; both passed after network permission was granted. Local tests do not establish live provider access, public upload success or seven-day unattended reliability.

Remaining automation work: verify YouTube OAuth/channel/quota and a private test upload; implement authorized Meta, TikTok and X publishing; connect a supported generation route within existing credits; configure alerts; provide secured persistent hosting; exercise recovery and endurance. Earlier YouTube quotaExceeded and OAuth popup failures are historical observations, not a fresh live connection check. No new charges, paid trials or top-ups are authorized.

StoreWitness is a separate project at https://github.com/aguirre546/storewitness and https://studio.victoraguirre.site/. Continue PurrFlow in its own chat. This upload is source preservation and does not submit another hackathon entry.
