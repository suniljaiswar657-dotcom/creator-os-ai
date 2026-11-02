# Creator OS AI

AI-assisted content command center for RomeoRex Gaming (BGMI · Hindi).

## Live
https://creator-os-ai-black.vercel.app

## Current build
- Responsive creator dashboard.
- BGMI Trend Radar with a dated research snapshot and source links.
- Local idea generator with Shorts/long-video formats, hooks, outlines and copy action.
- Creator review remains mandatory; nothing is auto-published.

## Research integrity
Trend entries are manually curated from linked sources and are **not a live feed**. Third-party tournament/event listings can change; verify dates, teams, scores, patch details and results against KRAFTON/BGMI official channels or the in-game client before recording or publishing. Generated ideas are local templates, not AI-generated output and not YouTube analytics.

## Next phases
1. Connect reliable trend retrieval and refresh workflow.
2. Add AI-backed idea and script generation.
3. Add content calendar and SEO metadata.
4. Add YouTube analytics integration.
5. Add creator-approved publishing automation.

Free-tier-first. No paid API or external publishing is enabled in this build.


## AI Script Studio (Phase 3)
- Adds a Vercel Node serverless endpoint at `/api/generate` using Gemini 2.5 Flash.
- Generates a title, opening hook, scene breakdown, full voice-over, YouTube description and tags from a selected or custom BGMI idea.
- The Gemini key is read only from the server-side `GEMINI_API_KEY` environment variable. Never put API keys in frontend code or commit them to Git.
- Setup: create a free-tier Gemini API key in Google AI Studio, then add it in Vercel Project Settings → Environment Variables as `GEMINI_API_KEY` for Production and Preview, and redeploy.
- Gemini free-tier availability and limits depend on model/region/account. Review Google's current terms and usage limits; free-tier prompts may be used to improve Google products.
- AI output can contain errors. Verify BGMI facts and creator claims before recording/publishing. No publishing integration or automatic posting is enabled.
