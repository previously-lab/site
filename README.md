# Previously — Official Site

> Previously on you.

The official website and documentation for **[Previously](https://github.com/LikeDreamwalker/previously)** — an open-source personal AI agent that organizes memory by time: a single timeline of episodic slices, not chat threads.

**Live**: [previously.ldwid.com](https://previously.ldwid.com)

## What's here

- **Landing page** — cinematic hero with the name-cycler, timeline-styled chapter sections
- **Docs** — 12 bilingual (English / 中文) documentation pages covering concepts, guides, and reference
- **SEO / GEO** — hreflang sitemap, JSON-LD structured data, [llms.txt](https://previously.ldwid.com/llms.txt), AI-crawler-friendly robots

Looking for the product itself? → [LikeDreamwalker/previously](https://github.com/LikeDreamwalker/previously)

## Tech stack

| Technology | Purpose |
| --- | --- |
| [Next.js 16](https://nextjs.org) | React framework (App Router + Turbopack) |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) (Base UI) | UI components |
| [next-intl](https://next-intl.dev) | i18n (English / 中文) |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark mode |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) + [Shiki](https://shiki.style) | MDX docs rendering |
| [motion](https://motion.dev) | Animations |

## Development

```bash
pnpm install
pnpm dev        # dev server at http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
```

## Project structure

```
content/docs/{en,zh}/   # MDX documentation content
messages/{en,zh}/       # UI translations
src/app/[locale]/       # Pages (landing + docs)
src/components/landing/ # Landing sections, timeline, hero effects
src/lib/docs/           # Docs manifest + content pipeline
src/lib/seo/            # JSON-LD components
```

See [CLAUDE.md](./CLAUDE.md) for the full architecture reference.

## Contributing

Typo fixes and documentation improvements are welcome — open an issue or PR.

## License

Code is licensed under [MIT](./LICENSE). Documentation content (`content/docs/`) is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — reuse with attribution to [previously.ldwid.com](https://previously.ldwid.com).

Built by [LikeDreamwalker](https://github.com/LikeDreamwalker)
