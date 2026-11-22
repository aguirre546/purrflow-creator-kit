# PurrFlow verification — November 20, 2026

## Result

The local Creator Kit and Studio source update is verified. Publication of this specific update remains pending approval. Before the update, GitHub main was public at `5c110f2bbd5ef881874b1a4b01325670a3958571` and Cloudflare's existing Creator Kit revision `7748cb63` was Ready at 100%. The public URL returned HTTP 200. These observations do not mean the new files have already been deployed.

The full unattended generation and five-platform publishing goal remains incomplete. No provider sign-in, new OAuth grant, real upload, public social post, billing change or competition submission was performed during this update.

## Source checks

- Creator Kit: **34 passed, 0 failed, 0 skipped**. The original 22 checks remain, with 12 video-cache lifecycle/transaction checks covering restoration, story mismatch, invalidation, delayed operations and storage failures.
- Studio: **74 passed, 0 failed, 0 skipped** in the final isolated suite. This includes queue safeguards, HTTP save/restart/access guards, real FFmpeg caption rendering, corrupt-video rejection, exception outbox behavior, configuration checks, n8n mock guards, 23 private-uploader checks and 9 operator reconciliation checks.
- Executed using installed Node `26.7.0` and existing FFmpeg `7.1`; source requires Node 22+. A separate execution on Node 22 was not performed. No package install is required by either app.
- Local loopback tests required execution outside the restricted socket sandbox. Initial `EACCES` results were environment restrictions; final authorized HTTP checks passed.
- The Studio test launcher strips live PurrFlow configuration from child processes, retaining only the configured FFmpeg path. Tests use temporary fixtures and mocked providers, with no production campaign or credentials.

## Browser and media checks

- Creator Kit initialized at its loopback URL. A real browser canvas render produced an MP4 and showed `Workspace + video saved`.
- Reload restored the matching video from IndexedDB and showed `Workspace + video restored`. The download link and `Export kit + video` action remained available.
- Exported the restored video in a ZIP. The ZIP extracted successfully and contained five platform captions, SRT, campaign/workspace JSON, calendar CSV, README and the MP4. The checked MP4 was 2,839,473 bytes, 720 × 1280, silent, approximately 15.24 seconds and 427 decoded frames. Complete decode passed at its native timebase. A default output timebase produced timestamp-quantization warnings; native-timebase decoding removed those warnings. Constant frame rate is not claimed.
- Editing the story immediately removed the old video/download and disabled exports until rebuild. Reloading after that edit did not resurrect the invalidated video.
- A separate Studio UI fixture was clearly labeled `QA fixture only`. Its review form rejected an empty no-send acknowledgment, then accepted the exact phrase, paused the fixture and displayed that provider API verification had not occurred. All provider endpoints were absent. No real post was sent.
- Browser screenshots are saved alongside the release files. The source was tested locally; the old public site was not changed.

## Live account checks and limits

- GitHub browser session was signed in as the repository owner. Command-line Git authentication was unavailable, so a browser upload is prepared.
- The signed-in n8n Cloud instance displayed `Your trial is over`. One attempt to execute the existing read-only YouTube channel workflow returned `Your trial has ended`. Google access, quota and channel identity were not freshly established.
- Cloudflare showed the existing static Creator Kit deployment Ready at revision `7748cb63`. Automatic approval review rejected staging the new deployment ZIP without explicit approval for this payload and production destination. No update was uploaded or deployed.
- Connected Runway reported no available video models. Google Omni API generation is a paid-tier capability; existing usable API credits/entitlements remain unverified. No generation was requested.
- Meta permissions and native publishers, X existing credits/access, an eligible TikTok integration, secure persistent processing, a real alert recipient and overnight/seven-day endurance remain open.

## Source packaging

The automation source ZIP excludes runtime campaigns, `.runtime` journals, locks, media uploads, environment secrets and Git metadata. Public n8n references remain `SELECT_YOUR_YOUTUBE_CREDENTIAL`. The separate private uploader stores no access token; its private runtime journal must be preserved locally and excluded from future source archives.

The full source package and a smaller GitHub update package are prepared with file manifests. A source ZIP or local test pass does not establish live provider access or deployment success.
