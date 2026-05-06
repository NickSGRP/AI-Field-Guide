# AI Field Guide

> A field guide for builders. The first entry: D.R.A.F.T. — a worksheet for accountants (and other thoughtful builders) who want to scope, plan, and ship AI tools without starting from a blank page.

The AI Field Guide is a growing collection of frameworks, tools, and worksheets to help professionals make sense of building with AI. This repository contains the first entry: a single-page interactive tool built around two frameworks — **D.R.A.F.T.** for defining the idea and **S.T.A.C.K.** for listing the ingredients — with an opt-in architecture diagram showing how the layers connect.

The tool was built for delivery to professional services audiences, particularly accounting firms exploring how to build their own AI tools, agents, and apps without overcommitting on the first try.

---

## Table of Contents

- [What it does](#what-it-does)
- [The two frameworks](#the-two-frameworks)
- [Screenshots](#screenshots)
- [Running it locally](#running-it-locally)
- [Deploying](#deploying)
- [File structure](#file-structure)
- [Design principles](#design-principles)
- [Roadmap](#roadmap)
- [Notes for future development](#notes-for-future-development)

---

## What it does

The tool walks a user through two steps:

1. **D.R.A.F.T. your idea** — five questions that scope the project. The user picks an option for each and writes their own context in their own words. The tool lands them on one of nine archetypes (e.g. *The Workshop*, *The Practice Tool*, *The Operating System*) and one of five build complexity tiers (e.g. *Right Now!*, *Weekend Build*, *Sprint Build*, *Project Build*, *Program Build*).

2. **Build your S.T.A.C.K.** — five ingredient cards showing what each layer of the build looks like at the chosen tier, with suggested tools (M365, Google Workspace, Azure, AWS, etc.), watch-outs, and an opt-in architecture diagram showing how the layers connect.

Two iteration buttons — **Love it, but simpler** and **More ambitious** — let users walk their idea up or down the tier ladder and see how the recommended stack reshapes in response.

The whole experience is designed to be completed in 10 minutes. The output is a printable PDF or copyable text summary — a planning artefact the user can share with a partner, IT lead, or compliance team.

---

## The two frameworks

### D.R.A.F.T. — Defining the idea

| Letter | Word | Question | Levels |
|---|---|---|---|
| **D** | Destination | Who is this AI tool actually for? | Just me · My team · The whole firm |
| **R** | Records | What kind of data will it touch? | Public · Internal · Client & regulated |
| **A** | Autonomy | How much should it decide on its own? | Suggests · Drafts · Acts |
| **F** | Fit | How does this sit alongside your existing systems and processes? | Separate · Linked · Embedded |
| **T** | Transfer | Who do you transfer ownership and responsibility to? | No transfer · Named owner · Funded function |

### S.T.A.C.K. — Listing the ingredients

| Letter | Word | What it covers |
|---|---|---|
| **S** | Storage | Where your data lives at rest (OneDrive, SharePoint, Microsoft Lists, Supabase, Snowflake) |
| **T** | Thoughts | The LLM that does the thinking (M365 Copilot, Custom GPTs, Claude Projects, API access) |
| **A** | Auth | Who's allowed in (your account, M365 sharing, Entra ID SSO, enterprise IAM) |
| **C** | Compute | Where the code actually runs (the AI platform, Power Automate, Netlify, Azure App Service) |
| **K** | KPIs | What you measure to know it's working (gut feel, OneNote, Power BI, full observability) |

### The five complexity tiers

| Icon | Tier | Builder | Time | Stack |
|---|---|---|---|---|
| ✦ | **Right Now!** | You + your AI | 30 sec – 5 min | A screenshot and a prompt |
| ◐ | **Weekend Build** | You | 1–2 weekends | Custom GPTs / Claude Projects / Copilot Agents |
| ◑ | **Sprint Build** | You + a colleague | 2–4 weeks | No-code / low-code |
| ◕ | **Project Build** | You + IT + a developer | 2–3 months | Custom integration |
| ● | **Program Build** | You + a team (or buy) | 6+ months | Enterprise platform |

---

## Screenshots

### Intro
![Intro screen](docs/images/01-intro.png)

### A question — Destination
![Destination question](docs/images/02-question-destination.png)

### Step 1 result — your archetype, tier, and example prompt
![Step 1 result](docs/images/03-result-step1.png)

### Step 2 — your S.T.A.C.K.
![Step 2 stack](docs/images/04-stack-step2.png)

### The architecture diagram (opt-in)
![Architecture diagram](docs/images/05-architecture.png)

### The "Right Now!" tier — ship something today
![Right Now tier](docs/images/06-right-now.png)

---

## Running it locally

The tool is vanilla HTML, CSS, and JavaScript — no build step, no dependencies.

To run it locally with a basic HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000` in your browser.

You can also just open `index.html` directly in a browser — but be aware that some browsers restrict clipboard operations for `file://` URLs, so the **Copy summary** and **Copy prompt** buttons may not work without a server.

---

## Deploying

This is a static site. Any static host will work.

### Netlify (drag-and-drop)
1. Sign in to [Netlify](https://app.netlify.com/).
2. Drag the project folder onto the dashboard.
3. Done. Netlify gives you a URL.

### Vercel (CLI)
```bash
npm i -g vercel
vercel
```

### GitHub Pages
1. Push to GitHub.
2. Settings → Pages → Source: deploy from `main` branch, root folder.
3. Wait a minute, then visit `https://<username>.github.io/<repo-name>/`.

### Cloudflare Pages
1. Connect your GitHub repo at [Cloudflare Pages](https://pages.cloudflare.com/).
2. Leave build command empty, output directory `/`.
3. Deploy.

---

## File structure

```
.
├── index.html          Markup for all screens (intro, 5 questions, result, stack)
├── styles.css          All styling — design tokens at top, sections marked with banners
├── script.js           State machine, archetype/tier logic, S.T.A.C.K. content, architecture SVG
├── docs/
│   └── images/         Screenshots used in this README
├── .gitignore          Ignores OS junk and editor temp files
└── README.md           This file
```

### How the JS is organised

The single `script.js` file is roughly structured as:

1. **State** — `answers`, `notes`, `projectName`, `currentStep`, `lastChange`
2. **Archetype data** — the nine D.R.A.F.T. archetypes (Sandbox, Workbench, etc.)
3. **Complexity tiers** — the five build tiers with icons, builder types, timeframes
4. **Stack content** — the 5×5 matrix of layer-by-tier guidance and tools
5. **Score functions** — `complexityScore()`, `getComplexityTier()`, `getRisk()`
6. **Iteration logic** — `simplify()`, `ambitionUp()` and the priority ordering
7. **Render functions** — `showStep()`, `renderResult()`, `renderStack()`, `renderArchitecture()`
8. **Plain-text summary builders** for copy-to-clipboard
9. **Event wiring** at the bottom

To change the recommended tools at a given tier, edit the `stackLayers` array. To change the archetypes, edit `archetypes`. To change the tier thresholds, edit `getComplexityTier()`.

---

## Design principles

A few decisions worth understanding before making changes:

- **Editorial tone, not corporate.** Fraunces (serif display) + DM Sans (body) + JetBrains Mono (labels). Plain English wherever possible. The voice is *consultant explaining a framework over coffee*, not enterprise SaaS marketing.
- **Build complexity, not risk, is the headline.** Earlier versions led with risk; user research with the target audience showed that risk language demotivated experimentation. Complexity is more empowering — *can I do this myself, or do I need help?* — while risk is preserved as a secondary callout.
- **Iteration is the real value.** The Simpler / More ambitious buttons are the most-used controls in user testing. The whole tool is designed to be re-run with different answers, not completed once.
- **Microsoft and Google ecosystems get explicit names at the lower tiers.** Most accountants live in M365 or Google Workspace and don't realise they already have most of the AI tools they need. Tools like *Copilot Studio* and *Power Automate* are named directly so the leap from "consumer AI" to "real build" doesn't feel like switching universes.
- **The architecture diagram is opt-in.** It sits behind a button on Step 2 because not every user wants it, and it adds visual weight that distracts from the cards if always-on. The shape stays the same across tiers; only the tool labels change. This is the durable lesson the diagram exists to teach.

---

## Roadmap

Ideas worth exploring in further development:

- **Save and resume.** Store project state in localStorage so users can return to a draft. (Currently every session starts fresh.)
- **Multi-project mode.** Side panel listing several drafts, switch between them.
- **Export as JSON.** Let users save and re-import their canvas, or share with a colleague.
- **AI-powered assistant.** A floating chat that helps users answer the questions — "given that you're building for your team, what records would you typically need?"
- **Side-by-side tier comparison.** When clicking "More ambitious", show the current tier and the proposed tier next to each other so the user can see exactly what gets added.
- **Industry packs.** Drop-in content sets for non-accounting audiences (lawyers, doctors, marketers) with their own tools and watch-outs.
- **Workshop facilitator mode.** A presenter view that shows aggregate answers from a room (each attendee's tier, common archetypes, etc.) for live workshop feedback.
- **A printable one-page canvas.** A blank PDF version of D.R.A.F.T. for offline workshop use — fill in by hand, then transcribe into the tool.
- **A Step 3 — "Build it"** screen that takes the user from a Right Now! result into actually opening Claude/ChatGPT/Copilot, with the example prompt pre-filled and contextualised with their notes.

---

## Notes for future development

A few things to keep in mind when making changes:

- **The tool uses no framework.** This is deliberate — it's small enough to live in one HTML/CSS/JS triplet, and the lack of dependencies means it'll still work in five years.
- **The design tokens live at the top of `styles.css`** in a `:root` block. Brand colours, fonts, and key spacing values are all there. Most cosmetic changes start there.
- **The internal data keys use the older words.** When the acronym changed from `Time` to `Transfer` and `Flow` to `Fit`, the user-facing labels were updated but the internal keys (`time`, `flow`) were left alone to avoid touching dozens of references. This is a small bit of legacy but it doesn't hurt anything.
- **Print styles are extensive.** The tool was designed to produce a clean printable PDF — both the Step 1 canvas and the Step 2 stack. If you change the visual structure, check the `@media print` block in `styles.css`.
- **The architecture SVG is generated from JS** in `renderArchitecture()`. Box positions are hard-coded against a `viewBox="0 0 920 520"`. Any layout changes need coordinates updated in the `layout` object.

---

*Built with care over a series of iterative conversations. The design evolved through six versions; the current production version is the result of that journey. This is the first entry in what I hope becomes a growing AI Field Guide.*
