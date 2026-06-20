export const CONFIG_ENDPOINTS =
[
	{
		route: "/api/config/keys",
		service: "Spring Boot",
		owner: "Backend Lead",
		method: "GET",
		payload: ["Response: { api_key, ingestion_key }"],
		group: "Config Keys",
		tables: [],
		tables_actions: "None",
		constraints: {
			criteria:
			[
				"Keys sourced from Spring Boot @ConfigurationProperties bean (vigil.api-key, vigil.ingestion-key)",
				"Auto-generated as UUID via @PostConstruct at startup if properties are absent",
				"Not stored in DB; live in memory for the lifetime of the process",
				"api_key: accepted as an alternative to JWT on all JWT-protected endpoints via Authorization: ApiKey <key>",
				"ingestion_key: separate from the general API key, once generated via @PostConstruct, written to a volume shared with the OTel Collector for secure provisioning",
				"Keys are read-only",
			],
			security: [],
			rateLimit: "10 req/min",
			realtime: "None",
			fallback: "None",
			dedup: "None",
		},
		authStrategy: ["JWT", "API_KEY"],
		id: "ep-config-keys",
	},
];

