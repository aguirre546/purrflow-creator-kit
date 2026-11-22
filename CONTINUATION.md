# PurrFlow / Mochi continuation

Updated November 20, 2026. Keep this project separate from StoreWitness. No new competition entry is authorized.

## Current source

The repository root contains the dependency-free Node 22+ Creator Kit. Run `npm test`, then `npm start`. Serve `dist/` for static hosting. The November 20 source adds browser video persistence: a rendered Blob is stored in IndexedDB and restored only with its exact saved story and render reference. Edits, rebuilding, template selection and JSON import invalidate the old video. Storage failure messages explain when to download a copy. JSON backups still exclude video.

`PurrFlow_Studio_Automation_Source.zip` contains the separate Node/filesystem/FFmpeg Studio source. Extract it separately. Run `npm test` for isolated tests, `npm run doctor` for a read-only configuration check and `npm start` for the loopback-only dashboard. It includes explicit held-job reconciliation and a separate `integrations/youtube-private-cli.mjs` tool. The CLI is not connected to the web scheduler. Its checks and uploads need an authorized process-environment token; no real credential or token is included.

## November 20 verification

- Creator Kit: 34 tests passed. Browser checks confirmed render autosave, restoration after reload, ZIP export containing the restored MP4, and invalidation after an edit and reload. The exported MP4 decoded successfully using its native timebase.
- Studio: 74 tests passed, including HTTP persistence, real FFmpeg rendering, a corrupt-video regression, guarded reconciliation and 23 mocked private-uploader checks. There were no failed or skipped tests in the final authorized local run.
- GitHub main was freshly confirmed public at `5c110f2bbd5ef881874b1a4b01325670a3958571` before this release. Cloudflare's existing static deployment was Ready at revision `7748cb63`. The source and static update files are prepared; their publication is pending explicit approval of the specific payloads and destinations.
- The signed-in n8n Cloud instance refused the read-only YouTube channel workflow with `Your trial has ended`. It did not establish current Google access or quota. No private upload or public post was attempted.

## Remaining gates to full automation

1. Restore a permitted execution path within the no-new-charges rule. The local Studio runs without an active n8n Cloud trial; secure persistent hosting, private storage and an actual alert recipient are still missing.
2. Complete approved YouTube OAuth and verify the exact Mochi channel, then one private upload and completed processing. Existing n8n secrets must stay private; do not copy them into chat or public source. New OAuth access needs the owner's specific consent. The CLI deliberately does not implement sign-in or refresh-token storage.
3. Establish a supported generation route with verified usable credits. The connected Runway workspace has no enabled video models. Google's Omni API is a paid-tier service; consumer Flow credits do not by themselves establish API entitlement. No billable generation request is authorized.
4. Verify Meta professional/Page accounts, permissions and native publishing receipts. Verify X API access and existing credits without purchasing more.
5. Use an eligible TikTok integration or reviewed export. Current TikTok Direct Post rules exclude utilities limited to developer/team-managed accounts; do not bypass that restriction.
6. Exercise recovery and observe overnight/seven-day operation after real connections are verified. Local tests and a seven-day editorial plan are not endurance evidence.

## Limits to preserve

Existing credits only. No purchases, billing attachment, paid trials or top-ups. Keep credentials, private upload-session URLs, runtime campaigns, journals and locks out of GitHub/source ZIPs. Never expose the loopback Studio as a public unauthenticated server. The n8n private-upload form remains inactive and must not become a public uploader. Keep operator confirmations distinct from provider API verification. Do not claim full unattended operation.

Provider references checked November 20: [YouTube resumable uploads](https://developers.google.com/youtube/data/guides/using_resumable_upload_protocol), [n8n trial limits](https://docs.n8n.io/deploy/use-n8n-cloud/start-your-free-trial.md), [Google API pricing](https://aistudio.google.com/docs/pricing#gemini-omni-1.2-flash), [TikTok rules](https://developers.tiktok.com/docs/en/content-sharing-guidelines), [X API pricing](https://docs.x.com/x-api/getting-started/pricing), and [Instagram publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing).
