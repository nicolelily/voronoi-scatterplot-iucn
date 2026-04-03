# Voronoi Scatterplot: Endangered Animals in the United States

**[Live chart](https://nicolelily.github.io/voronoi-scatterplot-iucn/)** | #30DayChartChallenge 2026 Day 3 - Mosaic

![Voronoi scatterplot showing 889 endangered US animal species colored by IUCN Red List category](static/favicon.png)

## About this chart

This Voronoi scatterplot visualizes **889 endangered animal species** in the United States that face human-caused threats, drawn from the IUCN Red List.

Each dot represents a species. The **x-axis** shows the total number of human-caused threats facing that species, while the **y-axis** shows how many distinct threat categories those threats span (e.g., pollution, habitat loss, climate change). The three colored Voronoi zones — **amber** (Vulnerable), **red** (Endangered), and **dark red** (Critically Endangered) — reveal a clear pattern: critically endangered species tend to face more threats across more categories.

### Why a Voronoi scatterplot?

The Day 3 prompt is **Mosaic**. A Voronoi diagram partitions a plane into regions closest to each seed point — a natural mosaic. Layering it over a scatterplot lets the colored zones flow into each other, making it easy to see where the three IUCN categories cluster and how they relate to threat burden. It's a mosaic that tells a story.

## #30DayChartChallenge 2026 — Animal Welfare

For the 2026 challenge, all of my entries use **animal welfare data**. This entry focuses on the human-driven threats pushing US wildlife toward extinction — from habitat destruction and pollution to climate change and invasive species.

## Data

**Source:** [IUCN Red List of Threatened Species](https://www.iucnredlist.org/) API v4

**Pipeline:**
1. Fetched all ~14,000 species assessed in the US via the `/countries/US` endpoint
2. Filtered to Vulnerable (VU), Endangered (EN), and Critically Endangered (CR) categories
3. Retrieved full assessments for each to get taxonomy and threat data
4. Kept only kingdom Animalia species with at least one human-caused threat
5. Classified threats using the IUCN threat classification scheme (codes 1-9, 11)

Human-caused threat categories include: residential & commercial development, agriculture & aquaculture, energy production & mining, transportation, biological resource use, human intrusions & disturbance, natural system modifications, invasive & problematic species, pollution, and climate change & severe weather.

**Citation:** IUCN 2025. IUCN Red List of Threatened Species. Version 2025-2 <www.iucnredlist.org>

## Tech stack

- **[SvelteKit](https://svelte.dev/)** — static site with adapter-static
- **[Observable Plot](https://observablehq.com/plot/)** — `Plot.voronoi` + `Plot.dot` marks
- **[Simple Data Analysis](https://github.com/nshiab/simple-data-analysis)** — data processing pipeline (DuckDB under the hood)
- **[Deno](https://deno.com/)** — runtime and task runner
- **GitHub Pages** — hosting

## Running locally

```bash
# Terminal 1: run the data pipeline (requires IUCN_API_KEY env var)
IUCN_API_KEY=your_key_here deno task sda

# Terminal 2: start the dev server
deno task dev
```

The processed data is committed to the repo at `src/data/us_endangered_animalia.json`, so you only need to rerun the pipeline if you want to refresh the data.

## Created by

[Nicole Mark](https://www.nicoledesignsdata.net)
