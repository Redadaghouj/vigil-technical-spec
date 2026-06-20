export default {
	meta: {
		fixable: "code",
		schema: [
			{
				type: "object",
				properties: {
					maxLen: { type: "integer", minimum: 1 },
				},
				additionalProperties: false,
			},
		],
	},
	create(context)
	{
		const src = context.sourceCode;
		const maxLen = context.options[0]?.maxLen ?? 80;

		/* ── Key order for endpoint objects ── */
		const KEY_ORDER =
		[
			"route",
			"service",
			"owner",
			"method",
			"payload",
			"group",
			"tables",
			"tables_actions",
			"constraints",
			"id",
		];

		const CONSTRAINTS_KEY_ORDER =
		[
			"criteria",
			"security",
			"rateLimit",
			"realtime",
			"fallback",
			"dedup",
		];

		function getKeyOrder(key, orderList)
		{
			const idx = orderList.indexOf(key);
			return idx === -1 ? orderList.length : idx;
		}

		/* ── Rule 1: `= {` / `= [` must move to the next line ── */
		function checkAssignment(node)
		{
			const rhs = node.right ?? node.init;
			if (!rhs) return;
			const tokens = src.getTokensBetween(node.left ?? node.id, rhs);
			const eq = tokens.find((t) => t.value === "=");
			if (!eq) return;
			const next = src.getTokenAfter(eq);
			if (
				next &&
				(next.value === "{" || next.value === "[") &&
				eq.loc.start.line === next.loc.start.line &&
				rhs.loc.start.line !== rhs.loc.end.line
			)
			{
				context.report({
					node,
					message: "= followed by { or [ must be on the next line.",
					fix(fixer)
					{
						const indent = src.lines[eq.loc.start.line - 1].match(/^(\s*)/)[1];
						return fixer.replaceTextRange(
							[eq.range[1], next.range[0]],
							"\n" + indent,
						);
					},
				});
			}
		}

		/* ── Rule 2: every item in a multi-line { } / [ ] on its own line,
							 OR when the single-line form exceeds maxLen ── */
		function checkBracketContents(node)
		{
			const rawItems = node.properties ?? node.elements ?? [];
			const items = rawItems.filter(Boolean);
			if (items.length === 0) return;

			const openToken = src.getFirstToken(node);
			const closeToken = src.getLastToken(node);

			const isSingleLine =
				openToken.loc.start.line === closeToken.loc.start.line;

			if (isSingleLine)
			{
				const lineText = src.lines[openToken.loc.start.line - 1];
				if (lineText.length <= maxLen) return;
			}

			const baseIndent =
				src.lines[openToken.loc.start.line - 1].match(/^(\s*)/)[1];
			const itemIndent = baseIndent + "   ";
			const edits = [];

			const firstItem = items[0];
			if (firstItem.loc.start.line === openToken.loc.start.line)
			{
				edits.push([openToken.range[1], firstItem.range[0], "\n" + itemIndent]);
			}

			for (let i = 1; i < items.length; i++)
			{
				const prev = items[i - 1];
				const curr = items[i];
				const comma = src.getTokenAfter(prev);
				if (
					comma?.value === "," &&
					curr.loc.start.line === comma.loc.start.line
				)
				{
					edits.push([comma.range[1], curr.range[0], "\n" + itemIndent]);
				}
			}

			const lastItem = items[items.length - 1];
			if (closeToken.loc.start.line === lastItem.loc.end.line)
			{
				const tokenBeforeClose = src.getTokenBefore(closeToken);
				edits.push([
					tokenBeforeClose.range[1],
					closeToken.range[0],
					"\n" + baseIndent,
				]);
			}

			if (edits.length === 0) return;

			context.report({
				node,
				message: isSingleLine
					? `Single-line bracket exceeds ${maxLen} characters; each item must be on its own line.`
					: "Each item in a multi-line object/array must be on its own line.",
				fix(fixer)
				{
					return edits.map(([start, end, text]) =>
						fixer.replaceTextRange([start, end], text),
					);
				},
			});
		}

		/* ── Rule 3: enforce key order in endpoint / constraints objects ── */
		function checkPropertyOrder(node, orderList)
		{
			const props = (node.properties ?? []).filter(
				(p) => p.type === "Property" && p.key,
			);
			if (props.length === 0) return;

			// Only enforce if every key in the object appears in our order list
			const keys = props.map((p) =>
				p.key.type === "Identifier" ? p.key.name : p.key.value,
			);
			const allKnown = keys.every((k) => orderList.includes(k));
			if (!allKnown) return;

			const sorted =
			[...keys].sort(
				(a, b) => getKeyOrder(a, orderList) - getKeyOrder(b, orderList),
			);
			const alreadySorted = keys.every((k, i) => k === sorted[i]);
			if (alreadySorted) return;

			context.report({
				node,
				message: `Object properties must follow the prescribed key order: ${sorted.join(", ")}.`,
				fix(fixer)
				{
					// Collect each property's text WITHOUT its trailing comma,
					// and track the full range including the comma so we can replace it.
					const propData = props.map((prop) =>
					{
						const afterProp = src.getTokenAfter(prop);
						const hasComma = afterProp?.value === ",";
						const fullEnd = hasComma ? afterProp.range[1] : prop.range[1];
						const rawText = src.getText().slice(prop.range[0], fullEnd);
						// Strip the trailing comma (and any whitespace between prop and comma)
						const bareText = hasComma
							? src.getText().slice(prop.range[0], prop.range[1])
							: rawText;
						return { prop, fullEnd, bareText };
					});

					// Build a map of key → bare text
					const bareByKey = Object.fromEntries(
						keys.map((k, i) => [k, propData[i].bareText]),
					);

					// Replace each original slot with the correctly-ordered property,
					// re-adding a comma for every slot except the last.
					return sorted.map((key, i) =>
					{
						const { prop, fullEnd } = propData[i];
						const isLast = i === sorted.length - 1;
						const newText = isLast ? bareByKey[key] : bareByKey[key] + ",";
						return fixer.replaceTextRange([prop.range[0], fullEnd], newText);
					});
				},
			});
		}

		/* ── Rule 4: template literals are forbidden in JSX attribute values ──
		   Rationale: `className={\`foo${bar}\`}` breaks JSON-based edit tools
		   because ${ } causes parse failures when the source is serialised.
		   Fix: extract the expression into a variable before the JSX return. */
		function checkJsxAttribute(node)
		{
			if (
				node.value?.type === "JSXExpressionContainer" &&
				node.value.expression?.type === "TemplateLiteral"
			)
			{
				context.report({
					node,
					message:
						"Template literals are not allowed in JSX attribute values. " +
						"Extract the expression into a variable before the return statement.",
				});
			}
		}

		/* ── Heuristic: is this object shaped like an endpoint entry? ── */
		function isEndpointObject(node)
		{
			const keys = (node.properties ?? [])
				.filter((p) => p.type === "Property" && p.key)
				.map((p) => (p.key.type === "Identifier" ? p.key.name : p.key.value));
			// Must have at least route + id to be considered an endpoint object
			return keys.includes("route") && keys.includes("id");
		}

		/* ── Heuristic: is this object shaped like a constraints block? ── */
		function isConstraintsObject(node)
		{
			const keys = (node.properties ?? [])
				.filter((p) => p.type === "Property" && p.key)
				.map((p) => (p.key.type === "Identifier" ? p.key.name : p.key.value));
			return (
				keys.includes("criteria") ||
				keys.includes("security") ||
				keys.includes("rateLimit")
			);
		}

		function checkObjectExpression(node)
		{
			checkBracketContents(node);
			if (isEndpointObject(node))
			{
				checkPropertyOrder(node, KEY_ORDER);
			}
			else if (isConstraintsObject(node))
			{
				checkPropertyOrder(node, CONSTRAINTS_KEY_ORDER);
			}
		}

		return {
			// Rule 1
			AssignmentExpression: checkAssignment,
			VariableDeclarator: checkAssignment,
			// Rule 2 + Rule 3
			ObjectExpression: checkObjectExpression,
			ArrayExpression: checkBracketContents,
			ObjectPattern: checkBracketContents,
			ArrayPattern: checkBracketContents,
			// Rule 4
			JSXAttribute: checkJsxAttribute,
		};
	},
};
