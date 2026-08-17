# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

The official website and documentation for **Previously** — an open-source personal AI agent that organizes memory by time (a single timeline of episodic slices, not chat threads). Live at https://previously.ldwid.com.

Related repos: the product itself lives in `previously-lab/agent`; this repo is the marketing site + docs only.

**Tech stack**: Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui (Base UI) · next-intl · next-themes · next-mdx-remote/rsc + Shiki

## Commands

- `pnpm dev` - Start dev server with Turbopack (port 3000)
- `pnpm build` - Production build with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm dlx shadcn@latest add [component]` - Add shadcn/ui component

## Architecture

### Layout Hierarchy

1. **Root Layout** (`src/app/layout.tsx`): fonts (Raleway + Geist Mono) + `ThemeProvider` (global)
2. **Locale Layout** (`src/app/[locale]/layout.tsx`): `NextIntlClientProvider` + `SiteHeader`/`SiteFooter` + full SEO metadata (per-locale)

### Landing Page (`src/app/[locale]/page.tsx`)

- **Design**: "cinematic dark" (放映厅) — a cold open of "Previously on you." in five acts + finale. The `.landing-scope` wrapper (globals.css) is theme-aware: dark = cinematic palette (canvas `oklch(0.145 0 0)`, white/10 hairlines), light = the product's light theme (near-white, black/10 hairlines, translucent white glass); glass/hairline/glow/grid/vignette all run on `--landing-*`/`--glow-*` tokens with per-theme values. Site chrome just follows the theme. Three-accent system mirroring the product: brand blue `oklch(0.6 0.23 260)` = time, amber = strands, emerald = evolution. `StageAtmosphere` (fixed aurora glows + grid + vignette) sits under everything; the hollow NOW dot is the recurring motif.
- **Structure**: `HeroSection` (giant tagline + self-typing `BriefingCard`) → `ProofBand` (code-drawn app UI mock) → three `ActSection`s (varied layouts, visuals `TimelineVisual` / `SelfModelVisual` / `ThinkingVisual`) → `TrustBand` (3 cards) → `FinaleSection`. Base scroll reveals via `ScrollReveal`; all copy via `messages/{en,zh}/landing.json`.
- Landing components live in `src/components/landing/`; client only where motion/interaction needs it.

### Docs (`src/app/[locale]/docs/[slug]`)

- **Content**: `content/docs/{en,zh}/*.mdx` — YAML frontmatter (zod-validated), rendered via `next-mdx-remote/rsc` + Shiki
- **Manifest**: `src/lib/docs/manifest.ts` — 4 sections, 12 slugs; drives sidebar and sitemap
- **Search**: cmdk ⌘K dialog
- Per-doc plain-text version at `/[locale]/docs/[slug]/llms.txt`

### Internationalization (next-intl)

- **Routing config**: `src/i18n/routing.ts` — locales (`en`, `zh`), default `en`
- **Request handler**: `src/i18n/request.ts` — switch-based static imports per namespace (Turbopack-compatible; no template-literal dynamic imports)
- **Navigation**: `src/i18n/navigation.ts` — always use these instead of `next/navigation`
- **Messages**: `messages/{en,zh}/*.json` — namespaced (common, landing, docs, theme, locale)
- **Proxy**: `src/proxy.ts` (Next 16 convention — middleware.ts is deprecated)

### SEO / GEO

- `src/lib/site.ts` — single source of truth: URLs, tagline, localized keywords
- `src/app/sitemap.ts` — all pages × locales with hreflang alternates (+ x-default)
- `src/app/robots.ts` — explicitly welcomes AI crawlers (GPTBot, ClaudeBot, PerplexityBot, …)
- `src/app/llms.txt/route.ts` + `llms-full.txt/route.ts` — llmstxt.org convention
- `src/lib/seo/json-ld.tsx` — typed JSON-LD components (TechArticle/Breadcrumb/FAQ used on doc pages); landing uses `src/components/landing/json-ld.tsx`
- `src/app/opengraph-image.tsx` — dynamic OG image (edge)

### Theme System

- `next-themes` with `attribute="class"`, `defaultTheme="system"`
- Provider wrapper: `src/providers/theme-provider.tsx`
- Neutral oklch palette in `globals.css`; the landing page is the exception — a cinematic, theme-aware scope (dark 放映厅 / product light) with the three-accent system (scoped via `.landing-scope`)

### shadcn/ui

- Style: `base-nova` · Base color: `neutral` · CSS variables enabled
- Components: `src/components/ui/` (via CLI; `flip-words`, `number-ticker`, `text-generate-effect` are adapted Aceternity/Magic UI components)
- Config: `components.json` · Utilities: `cn()` from `@/lib/utils`

### Path Aliases

- `@/*` → `./src/*` (tsconfig.json)

## Conventions

- All user-facing strings go through next-intl messages — no hardcoded copy
- The brand tagline "Previously on you." stays in English in both locales (untranslatable wordplay); always ASCII period, never full-width `。`
- Design language: huge type in hero/act titles, restrained body copy, semantic motion (each animation mirrors a real product mechanism) — see `src/components/landing/act-section.tsx`

## Extending

### Add a language
1. Add locale to `src/i18n/routing.ts` and `src/lib/site.ts`
2. Create `messages/[locale]/*.json` and `content/docs/[locale]/*.mdx`
3. Add the static import branch in `src/i18n/request.ts`

### Add a doc page
1. Create `content/docs/en/[slug].mdx` and `content/docs/zh/[slug].mdx` with frontmatter
2. Register the slug in `src/lib/docs/manifest.ts`
