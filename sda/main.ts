import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB({ logDuration: true });

const API_BASE = "https://api.iucnredlist.org/api/v4";
const API_KEY = Deno.env.get("IUCN_API_KEY");

if (!API_KEY) {
  console.error("Missing IUCN_API_KEY environment variable.");
  Deno.exit(1);
}

const headers = { Authorization: `Bearer ${API_KEY}` };

// --- Helpers ---

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} for ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

interface CountryAssessment {
  assessment_id: number;
  sis_taxon_id: number;
  taxon_scientific_name: string;
  red_list_category_code: string;
  year_published: string;
  possibly_extinct: boolean;
  possibly_extinct_in_the_wild: boolean;
}

interface ThreatRecord {
  code: string;
  description: { en: string };
  scope: string | null;
  severity: string | null;
  timing: string | null;
  score: string | null;
}

interface FullAssessment {
  assessment_id: number;
  taxon: {
    scientific_name: string;
    kingdom_name: string;
    phylum_name: string;
    class_name: string;
    order_name: string;
    family_name: string;
    genus_name: string;
    species_name: string;
    common_names?: { name: string; language: string; main: boolean }[];
  };
  red_list_category: { code: string; description: { en: string } };
  population_trend?: { code: string; description: { en: string } };
  threats: ThreatRecord[];
}

// Human-caused threat top-level codes (excludes 10=Geological events, 12=Other)
const HUMAN_THREAT_PREFIXES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "11"];

// Threat codes use underscores in the API (e.g. "9_3_2")
function isHumanCausedThreat(code: string): boolean {
  return HUMAN_THREAT_PREFIXES.some(
    (prefix) => code === prefix || code.startsWith(prefix + "_")
  );
}

// Top-level threat category names
const THREAT_CATEGORY_NAMES: Record<string, string> = {
  "1": "Residential & commercial development",
  "2": "Agriculture & aquaculture",
  "3": "Energy production & mining",
  "4": "Transportation & service corridors",
  "5": "Biological resource use",
  "6": "Human intrusions & disturbance",
  "7": "Natural system modifications",
  "8": "Invasive & problematic species",
  "9": "Pollution",
  "11": "Climate change & severe weather",
};

function topLevelThreatCode(code: string): string {
  // "9_3_2" -> "9", "11_2" -> "11"
  const parts = code.split("_");
  if (parts[0] === "11") return "11";
  return parts[0];
}

// =====================================================
// STEP 1: Fetch all US species (paginated, ~140 pages)
// =====================================================
console.log("\n=== Step 1: Fetching all US species ===");

const ENDANGERED_CODES = new Set(["VU", "EN", "CR"]);
const allUSEndangered: CountryAssessment[] = [];
let page = 1;

while (true) {
  console.log(`  Page ${page}...`);
  const data = await apiFetch<{ assessments: CountryAssessment[] }>(
    "/countries/US",
    { page: String(page), latest: "true" }
  );

  if (!data.assessments || data.assessments.length === 0) break;

  // Pre-filter to endangered categories immediately to save memory
  for (const a of data.assessments) {
    if (ENDANGERED_CODES.has(a.red_list_category_code)) {
      allUSEndangered.push(a);
    }
  }

  page++;
  await new Promise((r) => setTimeout(r, 200));
}

console.log(`\nTotal US endangered species (VU/EN/CR): ${allUSEndangered.length}`);

// =====================================================
// STEP 2: Fetch full assessments for endangered species
//         to get taxonomy (kingdom) and threats
// =====================================================
console.log("\n=== Step 2: Fetching full assessments for taxonomy + threats ===");

interface SpeciesRow {
  scientific_name: string;
  common_name: string | null;
  category: string;
  category_label: string;
  class_name: string;
  order_name: string;
  family_name: string;
  population_trend: string | null;
  num_human_threats: number;
  num_total_threats: number;
  threat_categories: string;
  threat_details: string;
  year_published: string;
  assessment_id: number;
  url: string;
}

const speciesRows: SpeciesRow[] = [];
const CATEGORY_LABELS: Record<string, string> = {
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
};

let fetched = 0;
const total = allUSEndangered.length;

for (const species of allUSEndangered) {
  fetched++;
  if (fetched % 50 === 0 || fetched === 1) {
    console.log(`  Fetching assessment ${fetched}/${total}: ${species.taxon_scientific_name}`);
  }

  try {
    const assessment = await apiFetch<FullAssessment>(
      `/assessment/${species.assessment_id}`
    );

    // Filter to Animalia only
    if (assessment.taxon.kingdom_name !== "ANIMALIA") continue;

    // Extract human-caused threats
    const allThreats = assessment.threats ?? [];
    const humanThreats = allThreats.filter((t) => isHumanCausedThreat(t.code));

    // Skip species with zero human-caused threats
    if (humanThreats.length === 0) continue;

    // Collect unique top-level threat categories
    const topCategories = [
      ...new Set(humanThreats.map((t) => topLevelThreatCode(t.code))),
    ];
    const categoryNames = topCategories
      .map((c) => THREAT_CATEGORY_NAMES[c] ?? c)
      .sort();

    // Detailed threat list
    const threatDetails = humanThreats
      .map((t) => t.description?.en ?? t.code)
      .sort();

    // Get English common name
    const commonName =
      assessment.taxon.common_names?.find((cn) => cn.language === "eng")
        ?.name ?? null;

    speciesRows.push({
      scientific_name: assessment.taxon.scientific_name,
      common_name: commonName,
      category: assessment.red_list_category.code,
      category_label: CATEGORY_LABELS[assessment.red_list_category.code] ?? assessment.red_list_category.code,
      class_name: assessment.taxon.class_name,
      order_name: assessment.taxon.order_name,
      family_name: assessment.taxon.family_name,
      population_trend: assessment.population_trend?.description?.en ?? null,
      num_human_threats: humanThreats.length,
      num_total_threats: allThreats.length,
      threat_categories: categoryNames.join("; "),
      threat_details: threatDetails.join("; "),
      year_published: species.year_published,
      assessment_id: species.assessment_id,
      url: `https://www.iucnredlist.org/species/${species.sis_taxon_id}/${species.assessment_id}`,
    });
  } catch (err) {
    console.warn(`  Warning: failed to fetch assessment ${species.assessment_id}: ${err}`);
  }

  // Rate limiting
  await new Promise((r) => setTimeout(r, 100));
}

console.log(`\nAnimalia species with human-caused threats: ${speciesRows.length}`);

// =====================================================
// STEP 3: Load into SDA, process, and write output
// =====================================================
console.log("\n=== Step 3: Processing with SDA ===");

const table = sdb.newTable("endangered");
await table.loadArray(speciesRows as Record<string, unknown>[]);

// Sort by category severity then by class
await table.sort({
  category: "asc",
  class_name: "asc",
  order_name: "asc",
  family_name: "asc",
});

await table.logTable();

// Write full dataset
await table.writeData("./src/data/us_endangered_animalia.json");
console.log("Wrote src/data/us_endangered_animalia.json");

// Summary stats
const summary = sdb.newTable("summary");
await summary.loadArray(speciesRows as Record<string, unknown>[]);
await summary.summarize({
  values: "scientific_name",
  categories: "category_label",
  summaries: "count",
});
await summary.logTable();

await sdb.done();

console.log("\n=== DONE ===");
