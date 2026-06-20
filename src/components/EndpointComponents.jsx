import { useState } from "react";
import { ENDPOINTS, PAGES, AUTH_STRATEGIES, ROLE_ENFORCEMENT_INFO } from "../data";
import Badge from "./ui/Badge.jsx";
import VisibilityBadge from "./ui/VisibilityBadge.jsx";
import RolePill from "./ui/RolePill.jsx";
import useMaskSpotlight from "../hooks/useMaskSpotlight.js";

const CONSTRAINT_CONFIG =
[
	{ key: "realtime", tag: "RT", type: "realtime", skip: (v) => v === "None" },
	{ key: "fallback", tag: "FALL", type: "fallback", skip: (v) => v === "None" },
	{ key: "dedup", tag: "DEDUP", type: "dedup", skip: (v) => v === "None" },
];

// Pretty-prints the loose shorthand shape strings used for request/response
// (e.g. "{ id, preset, service: a | b, custom?: x }") with indentation and
// line breaks, WITHOUT rewriting the shorthand into strict JSON syntax.
// Respects nested {}/[]/'' so values like "status: acknowledged | resolved"
// or "my_ack: { status, acked_at } | null" stay intact.
function formatShape(str)
{
	if (typeof str !== "string") return str;
	const trimmed = str.trim();
	if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return trimmed;

	const splitTopLevel = (inner) =>
	{
		const parts = [];
		let depth = 0, inQuote = null, current = "";
		for (let i = 0; i < inner.length; i++)
		{
			const c = inner[i];
			if (inQuote)
			{
				current += c;
				if (c === inQuote) inQuote = null;
				continue;
			}
			if (c === "'" || c === '"')
			{
				inQuote = c; current += c; continue;
			}
			if (c === "{" || c === "[") depth++;
			if (c === "}" || c === "]") depth--;
			if (c === "," && depth === 0)
			{
				parts.push(current.trim()); current = ""; continue;
			}
			current += c;
		}
		if (current.trim()) parts.push(current.trim());
		return parts;
	};

	const topLevelColonIdx = (f) =>
	{
		let depth = 0, inQuote = null;
		for (let i = 0; i < f.length; i++)
		{
			const c = f[i];
			if (inQuote)
			{
				if (c === inQuote) inQuote = null; continue;
			}
			if (c === "'" || c === '"')
			{
				inQuote = c; continue;
			}
			if (c === "{" || c === "[") depth++;
			if (c === "}" || c === "]") depth--;
			if (c === ":" && depth === 0) return i;
		}
		return -1;
	};

	const findMatchingClose = (s) =>
	{
		let depth = 0, inQuote = null;
		for (let i = 0; i < s.length; i++)
		{
			const c = s[i];
			if (inQuote)
			{
				if (c === inQuote) inQuote = null; continue;
			}
			if (c === "'" || c === '"')
			{
				inQuote = c; continue;
			}
			if (c === "{" || c === "[") depth++;
			if (c === "}" || c === "]")
			{
				depth--; if (depth === 0) return i;
			}
		}
		return -1;
	};

	const renderBlock = (text, indent) =>
	{
		const t = text.trim();
		const pad = "\t".repeat(indent);
		const padIn = "\t".repeat(indent + 1);
		const open = t[0];
		const close = open === "{" ? "}" : "]";

		const closeIdx = findMatchingClose(t);
		const inner = t.slice(1, closeIdx).trim();
		const trailing = t.slice(closeIdx + 1).trim();

		const body = !inner
			? open + close
			: open + "\n" + splitTopLevel(inner).map((f) => padIn + renderField(f, indent + 1)).join(",\n") + "\n" + pad + close;

		return trailing ? body + " " + trailing : body;
	};

	const renderField = (f, indent) =>
	{
		const colonIdx = topLevelColonIdx(f);
		if (colonIdx === -1)
		{
			const ft = f.trim();
			if (ft.startsWith("{") || ft.startsWith("[")) return renderBlock(ft, indent);
			return ft;
		}
		const key = f.slice(0, colonIdx).trim();
		const val = f.slice(colonIdx + 1).trim();
		if (val.startsWith("{") || val.startsWith("["))
		{
			return key + ": " + renderBlock(val, indent);
		}
		return key + ": " + val;
	};

	try
	{
		return renderBlock(trimmed, 0);
	}
	catch
	{
		return trimmed;
	}
}

function AuthStrategyRow({ ep })
{
	const [open, setOpen] = useState(null);
	const strats = (ep.authStrategy || [])
		.map((k) => AUTH_STRATEGIES[k])
		.filter(Boolean);
	if (!strats.length) return null;

	const activeStrat = strats.find((s) => s.id === open);

	return (
		<>
			<span className="meta-label meta-label--auth">Auth Strategy</span>
			<span className="meta-value meta-value--auth">
				{strats.map((s) => (
					<button
						key={s.id}
						className={"auth-strat-pill constraint-tag--" + s.tagType + (open === s.id ? " auth-strat-pill--open" : "")}
						onClick={() => setOpen((o) => (o === s.id ? null : s.id))}
					>
						{s.tag}{" "}
						<span className="auth-strat-pill-chevron">
							{open === s.id ? "▲" : "▼"}
						</span>
					</button>
				))}
			</span>
			{activeStrat && (
				<>
					<span />
					<div className="auth-strat-inline">
						<div className="auth-strat-inline-label">{activeStrat.label}</div>
						{activeStrat.items.map((item, i) => (
							<div className="gw-row-item" key={i}>
								<span className="gw-row-dot">·</span>
								<span className="constraint-text">{item}</span>
							</div>
						))}
					</div>
				</>
			)}
		</>
	);
}

// "ADMIN" / "ANY_AUTH" (the values endpoints store) -> the matching role entry
// in ROLE_ENFORCEMENT_INFO, by normalizing "ANY AUTH" -> "ANY_AUTH". Pulling
// the tag text + tagType from there means the color/label only ever lives
// in one place — gateway.js — same fix as requiredRole itself.
const ROLE_INFO_BY_KEY = Object.fromEntries(
	ROLE_ENFORCEMENT_INFO.roles.map((r) => [r.tag.replace(/\s+/g, "_"), r]),
);

function RequiredRoleRow({ ep })
{
	const info = ep.requiredRole && ROLE_INFO_BY_KEY[ep.requiredRole];
	if (!info) return null;

	return (
		<>
			<span className="meta-label meta-label--auth">Required Role</span>
			<span className="meta-value meta-value--auth">
				<span className={"constraint-tag constraint-tag--" + info.tagType}>
					{info.tag}
				</span>
			</span>
		</>
	);
}

function ConstraintSection({ ep, showUsedBy = true })
{
	const { constraints } = ep;
	const pages = PAGES.filter((p) => p.endpointIds.includes(ep.id));
	const [openPages, setOpenPages] = useState({});
	const [usedByOpen, setUsedByOpen] = useState(false);
	const [expandedEps, setExpandedEps] = useState({});

	const usedByRef = useMaskSpotlight(usedByOpen);

	const rows =
	[
		...CONSTRAINT_CONFIG.filter(({ key, skip }) => !skip(constraints[key])).map(
			({ key, tag, type }) => ({ tag, type, text: constraints[key], key }),
		),
		...constraints.criteria.map((c, i) => ({
			tag: "CRITER",
			type: "crit",
			text: c,
			key: "crit" + i,
		})),
		...constraints.security.map((c, i) => ({       // <-- add this block
			tag: "SEC",
			type: "sec",
			text: c,
			key: "sec" + i,
		})),
	];

	return (
		<div>
			{showUsedBy && pages.length > 0 && (
				<div ref={usedByRef} className="used-by-section spot">
					<div
						className="ep-section-head used-by-head"
						onClick={() => setUsedByOpen((o) => !o)}
					>
						Used by pages ({pages.length})
						<span
							className="ep-toggle"
							style={{ order: 2 }}
						>{usedByOpen ? "−" : "+"}</span>
					</div>
					<div className={"collapsible" + (usedByOpen ? " collapsible--open" : "")}>
						<div className="collapsible-inner used-by-section-body">
							{pages.map((p) => (
								<PageCard
									key={p.id}
									page={p}
									isOpen={!!openPages[p.id]}
									onToggle={() => setOpenPages((s) => ({ ...s, [p.id]: !s[p.id] }))}
									expandedEps={expandedEps}
									onToggleEp={(key) =>
										setExpandedEps((s) => ({ ...s, [key]: !s[key] }))
									}
								/>
							))}
						</div>
					</div>
				</div>
			)}
			{rows.length > 0 && (
				<div>
					<div className="ep-section-head">Constraints</div>
					{rows.map((r) => (
						<div className="constraint-row" key={r.key}>
							<span className={"constraint-tag constraint-tag--" + r.type}>
								{r.tag}
							</span>
							<span className="constraint-text">{r.text}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function PayloadSection({ label, value })
{
	const [open, setOpen] = useState(false);
	const ref = useMaskSpotlight(open);
	const frameCount = typeof value === "string" ? 1 : Object.keys(value).length;

	return (
		<div ref={ref} className="payload-section spot">
			<div
				className="ep-section-head payload-section-head"
				onClick={() => setOpen((o) => !o)}
			>
				{label} ({frameCount})
				<span className="ep-toggle" style={{ order: 2 }}>{open ? "−" : "+"}</span>
			</div>
			<div className={"collapsible" + (open ? " collapsible--open" : "")}>
				<div className="collapsible-inner payload-section-body">
					{typeof value === "string"
						? <pre className="shape-pre">{formatShape(value)}</pre>
						: Object.entries(value).map(([frame, shape], i, arr) => (
							<div key={frame} className="shape-frame">
								<span className="meta-frame-key">{frame}:</span>
								<pre className="shape-pre">{formatShape(shape)}</pre>
								{i < arr.length - 1 ? <div className="shape-frame-sep" /> : null}
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

// Renders URI query params as pills — deliberately NOT routed through
// PayloadSection's code-block/frame rendering, so a query string can never
// be visually mistaken for a request body or a WS frame.
function QueryParamsSection({ params })
{
	if (!params || params.length === 0) return null;

	return (
		<div className="query-params-section">
			<div className="ep-section-head">Query Params ({params.length})</div>
			<div className="query-params-row">
				{params.map((p) => (
					<span
						key={p.name}
						className={"query-param-pill" + (p.required ? " query-param-pill--required" : "")}
					>
						<span className="query-param-name">
							{p.required ? p.name : "?" + p.name}
						</span>
						<span className="query-param-type">{p.type}</span>
					</span>
				))}
			</div>
		</div>
	);
}

function EndpointCard({
	ep,
	expanded,
	onToggle,
	highlighted,
	showUsedBy = true,
})
{
	const ref = useMaskSpotlight(expanded);

	return (
		<div
			ref={ref}
			id={ep.id}
			className={"ep-card spot" + (highlighted ? " highlight-ring" : "")}
		>
			<div className="ep-card-header" onClick={onToggle}>
				<Badge method={ep.method} />
				<span className="ep-route">{ep.route}</span>
				<VisibilityBadge internal={ep.internal} />
				<span className="ep-toggle">{expanded ? "−" : "+"}</span>
			</div>
			<div className={"collapsible" + (expanded ? " collapsible--open" : "")}>
				<div className="collapsible-inner ep-body">
					<div className="ep-meta-grid">
						<span className="meta-label">Service</span>
						<span className="meta-value meta-value--service">{ep.service}</span>
						<span className="meta-label">Owner</span>
						<span
							className={"meta-value role--" + ep.owner.toLowerCase().replace(/\s+/g, "-")}
						>
							{ep.owner}
						</span>
						{ep.tables.length > 0 && (
							<>
								<span className="meta-label">Tables</span>
								<span className="meta-value meta-value--tables">
									{ep.tables.join(", ")}: {ep.tables_actions}
								</span>
							</>
						)}
						{ep.constraints.rateLimit &&
							ep.constraints.rateLimit !== "N/A" &&
							ep.constraints.rateLimit !== "Not rate limited" && (
							<>
								<span className="meta-label">Rate limit</span>
								<span className="meta-value meta-value--tables">
									{ep.constraints.rateLimit}
								</span>
							</>
						)}
						<AuthStrategyRow ep={ep} />
						<RequiredRoleRow ep={ep} />
					</div>
					{ep.method === "WS"
						? ep.request && <PayloadSection label="Request" value={ep.request} />
						: ep.request && (
							<>
								<QueryParamsSection params={ep.request.query} />
								{ep.request.body && (
									<PayloadSection label="Body" value={ep.request.body} />
								)}
							</>
						)}
					{ep.response && (
						<PayloadSection label="Response" value={ep.response} />
					)}
					<ConstraintSection ep={ep} showUsedBy={showUsedBy} />
				</div>
			</div>
		</div>
	);
}

function PageCard({
	page,
	isOpen,
	onToggle,
	expandedEps,
	onToggleEp,
	highlightEndpointId,
})
{
	const eps = ENDPOINTS.filter((e) => page.endpointIds.includes(e.id));
	const roles = page.role.split(" + ");
	const ref = useMaskSpotlight(isOpen);

	return (
		<div ref={ref} className={"page-card spot" + (isOpen ? " page-card--open" : "")}>
			<div className="page-card-header" onClick={onToggle}>
				<div className="page-card-header-flex">
					<span className="page-name">{page.name}</span>
					<span className="page-path">{page.path}</span>
				</div>
				<span className="text-mono-small">{eps.length} ep</span>
				<span className="ep-toggle">{isOpen ? "−" : "+"}</span>
			</div>
			<div className={"collapsible" + (isOpen ? " collapsible--open" : "")}>
				<div className="collapsible-inner page-body">
					<div>
						{roles.map((r) => (
							<RolePill key={r} role={r} />
						))}
					</div>
					<p className="page-desc">{page.desc}</p>
					{eps.length === 0 ? (
						<div className="static-page-msg">Static page - no API endpoints.</div>
					) : (
						<div>
							<div className="ep-section-head">Endpoints used</div>
							{eps.map((ep) =>
							{
								const key = page.id + ep.id;
								const isHighlighted = highlightEndpointId === ep.id;
								return (
									<EndpointCard
										key={ep.id}
										ep={ep}
										expanded={!!expandedEps?.[key] || isHighlighted}
										onToggle={() => onToggleEp?.(key)}
										highlighted={isHighlighted}
										showUsedBy={false}
									/>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export { EndpointCard, PageCard, ConstraintSection, AuthStrategyRow };
