<script>
  import * as Plot from "@observablehq/plot";
  import data from "../data/us_endangered_animalia.json";

  // Seeded random for reproducible jitter
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(42);

  // Count unique threat categories per species for the y-axis,
  // and jitter x/y so overlapping integer coords spread out
  const species = data.map((d) => ({
    ...d,
    num_threat_categories: d.threat_categories
      ? d.threat_categories.split("; ").length
      : 0,
    jitter_x: d.num_human_threats + (rand() - 0.5) * 0.8,
    jitter_y:
      (d.threat_categories ? d.threat_categories.split("; ").length : 0) +
      (rand() - 0.5) * 0.8,
  }));

  // Order categories by severity for the legend
  const categoryOrder = ["Vulnerable", "Endangered", "Critically Endangered"];

  let chartContainer = $state();

  $effect(() => {
    if (!chartContainer) return;

    const chart = Plot.plot({
      width: 900,
      height: 600,
      marginBottom: 50,
      marginLeft: 60,
      color: {
        domain: categoryOrder,
        range: ["#f59e0b", "#ef4444", "#7f1d1d"],
        legend: true,
      },
      x: {
        label: "Number of human-caused threats",
        nice: true,
      },
      y: {
        label: "Number of distinct threat categories",
        nice: true,
      },
      marks: [
        Plot.voronoi(species, {
          x: "jitter_x",
          y: "jitter_y",
          fill: "category_label",
          fillOpacity: 0.15,
          stroke: "var(--bg, white)",
          strokeWidth: 1,
        }),
        Plot.dot(species, {
          x: "jitter_x",
          y: "jitter_y",
          fill: "category_label",
          r: 3.75,
          fillOpacity: 0.75,
          tip: {
            channels: {
              "Common name": "common_name",
              Class: "class_name",
              Family: "family_name",
              "Population trend": "population_trend",
            },
          },
          title: (d) =>
            `${d.common_name ?? d.scientific_name}\n${d.category_label}\n${d.num_human_threats} threats across ${d.num_threat_categories} categories`,
        }),
        Plot.frame(),
      ],
    });

    chartContainer.replaceChildren(chart);
  });
</script>

<h1>Endangered Animals in the United States</h1>
<p>
  {species.length} species in kingdom Animalia with human-caused threats, from the
  <a href="https://www.iucnredlist.org/">IUCN Red List</a>.
</p>

<div bind:this={chartContainer} class="chart"></div>

<p class="caption">
  #30DayChartChallenge 2026 Day 3 - Mosaic | Created by
  <a href="https://www.nicoledesignsdata.net">Nicole Mark</a> |
  IUCN 2025. IUCN Red List of Threatened Species. Version 2025-2
  &lt;www.iucnredlist.org&gt;
</p>

<style>
  .chart {
    max-width: 960px;
    margin: 2rem auto;
  }
  .caption {
    max-width: 960px;
    margin: 0.5rem auto;
    font-size: 0.85rem;
    color: #666;
  }
</style>
