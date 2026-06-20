export const TELEMETRY_ENDPOINTS =
[
	{
		route: "/api/telemetry/metrics",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "GET",
		payload:
		[
			"?period",
			"?service",
			"?count",
			"?offset",
			"Response: { data[], hasMore: boolean }",
		],
		group: "Telemetry",
		tables: ["metrics"],
		tables_actions: "Read",
		constraints: {
			criteria:
			[
				"Data and Analytics Major Dashboard (2pt)",
				"Infinite scroll via offset pagination",
				"hasMore derived server-side: returned.length === count",
				"Status page passes ?vigil.internal=true for infra metrics panel — intentional dual-call (service vs infra). Fulfils DevOps Minor Health check + status page (1pt)",
			],
			security: [],
			rateLimit: "10 req/min",
			realtime: "None",
			fallback: "None",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-metrics",
	},
	{
		route: "/api/telemetry/traces",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "GET",
		payload:
		[
			"?period",
			"?service",
			"?sort",
			"?count",
			"?offset",
			"Response: { data[], hasMore: boolean }",
		],
		group: "Telemetry",
		tables: ["traces"],
		tables_actions: "Read",
		constraints: {
			criteria:
			[
				"Data export (1pt)",
				"Infinite scroll via offset pagination",
				"hasMore derived server-side: returned.length === count",
			],
			security: [],
			rateLimit: "10 req/min",
			realtime: "None",
			fallback: "None",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-traces",
	},
	{
		route: "/api/telemetry/logs",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "GET",
		payload:
		[
			"?period",
			"?service",
			"?severity",
			"?search",
			"?sort",
			"?count",
			"?offset",
			"Response: { data[], hasMore: boolean }",
		],
		group: "Telemetry",
		tables: ["logs"],
		tables_actions: "Read, new records only",
		constraints: {
			criteria:
			[
				"Web Minor Advanced search (1pt)",
				"Data export (1pt)",
				"Infinite scroll via offset pagination",
				"hasMore derived server-side: returned.length === count",
			],
			security: [],
			rateLimit: "10 req/min",
			realtime: "None",
			fallback: "None",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-logs",
	},
	{
		route: "/api/telemetry/logs/live",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "SSE",
		payload:
		[
			"?service",
			"?severity",
			"server frame: { service, timestamp, trace_id, severity, message, attributes }",
		],
		group: "Telemetry",
		tables: ["logs"],
		tables_actions: "Read",
		constraints: {
			criteria:
			[
				"Frame shape identical to single REST log record",
			],
			security: [],
			rateLimit: "N/A",
			realtime: "SseEmitter per subscriber. Pushes matching new log records on each OTel batch. Accepts ?token= for JWT or API key (native EventSource cannot set headers).",
			fallback: "Browser EventSource reconnects automatically",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-logs-live",
	},
	{
		route: "/api/telemetry/traces/live",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "SSE",
		payload:
		[
			"?service",
			"server frame: { trace_id, span_id, parent_span_id, name, service, timestamp, duration_ms, status, attributes }",
		],
		group: "Telemetry",
		tables: ["traces"],
		tables_actions: "Read",
		constraints: {
			criteria:
			[
				"Frame shape identical to single REST trace record",
			],
			security: [],
			rateLimit: "N/A",
			realtime:
				"SseEmitter per subscriber. Pushes matching new trace records on each OTel batch. Accepts ?token= for JWT or API key (native EventSource cannot set headers).",
			fallback: "Browser EventSource reconnects automatically",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-traces-live",
	},
	{
		route: "/api/telemetry/metrics/live",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "SSE",
		payload:
		[
			"?service",
			"server frame: { service, timestamp, name, value, attributes }",
		],
		group: "Telemetry",
		tables: ["metrics"],
		tables_actions: "Read",
		constraints: {
			criteria:
			[
				"Frame shape identical to single REST metric record",
			],
			security: [],
			rateLimit: "N/A",
			realtime:
				"SseEmitter per subscriber. Pushes matching new metric records on each OTel batch. Accepts ?token= for JWT or API key (native EventSource cannot set headers).",
			fallback: "Browser EventSource reconnects automatically",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-metrics-live",
	},
	{
		route: "/api/telemetry/attributes",
		service: "Spring Boot + ClickHouse",
		owner: "Telemetry Engineer",
		method: "GET",
		payload: [],
		group: "Telemetry",
		tables: ["logs", "metrics", "traces"],
		tables_actions: "Read (last 7 days)",
		constraints: {
			criteria: ["Used to validate custom alert rule attributes"],
			security: [],
			rateLimit: "10 req/min",
			realtime: "None",
			fallback: "None",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-telemetry-attributes",
	},
];

