// ─── VALIDATE ────────────────────────────────────────────────────────────────
// Run with: node src/data/validate.js
// Catches the category of contradictions found in the spec review:
//   - duplicate endpoint IDs
//   - authStrategy keys that don't exist in AUTH_STRATEGIES
//   - page endpointIds that don't map to a real endpoint

import { AUTH_STRATEGIES }  from "./gateway.js";
import { ENDPOINTS }        from "./index.js";
import { PAGES }            from "./pages.js";

const errors = [];

// ── 1. Duplicate endpoint IDs ─────────────────────────────────────────────
const seen = new Set();
for (const ep of ENDPOINTS)
{
	if (seen.has(ep.id)) errors.push(`Duplicate endpoint id: "${ep.id}"`);
	seen.add(ep.id);
}

// ── 2. authStrategy keys exist in AUTH_STRATEGIES ────────────────────────
const validStrategies = new Set(Object.keys(AUTH_STRATEGIES));
for (const ep of ENDPOINTS)
{
	for (const key of ep.authStrategy)
	{
		if (!validStrategies.has(key))
			errors.push(`${ep.id}: unknown authStrategy "${key}" (valid: ${[
			   ...validStrategies
			].join(", ")})`);
	}
}

// ── 3. Page endpointIds reference real endpoints ──────────────────────────
for (const page of PAGES)
{
	for (const epId of (page.endpointIds ?? []))
	{
		if (!seen.has(epId))
			errors.push(`${page.id}: endpointId "${epId}" not found in ENDPOINTS`);
	}
}

// ── Report ────────────────────────────────────────────────────────────────
if (errors.length === 0)
{
	console.log(`✓ validate passed — ${ENDPOINTS.length} endpoints, ${PAGES.length} pages`);
	process.exit(0);
}
else
{
	console.error(`✗ validate failed (${errors.length} error${errors.length > 1 ? "s" : ""}):`);
	errors.forEach(e => console.error(`  • ${e}`));
	process.exit(1);
}
