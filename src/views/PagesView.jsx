import { useState, useEffect } from "react";
import { PAGES } from "../data";
import useToggleSet from "../hooks/useToggleSet.js";
import groupBy from "../utils/groupBy.js";
import PagesGroupSection from "../components/PagesGroupSection.jsx";
import StatChip from "../components/ui/StatChip.jsx";

/**
 * PagesView displays all pages grouped by logical groups, with role statistics.
 */
export default function PagesView({ highlightPageId, highlightEndpointId })
{
	const [open, setOpen] = useState(highlightPageId || null);
	const [expandedEps, setExpandedEps] = useState({});
	const [openGroups, toggleGroup, ensureGroup] = useToggleSet();

	useEffect(() =>
	{
		if (highlightPageId)
		{
			const t = setTimeout(() =>
			{
				setOpen(highlightPageId);
			}, 0);
			const page = PAGES.find((p) => p.id === highlightPageId);
			if (page?.group) ensureGroup(page.group);
			return () => clearTimeout(t);
		}
	}, [highlightPageId, ensureGroup]);

	const groups = groupBy(PAGES);

	return (
		<div>
			<div className="panel-title">Pages</div>
			<div className="panel-sub">{PAGES.length} routes in the application</div>

			<div className="stat-row">
				{[...new Set(PAGES.flatMap((p) => p.role.split(" + ")))].map((role) =>
				{
					const cls = "role--" + role.toLowerCase().replace(/\s+/g, "-");
					const count = PAGES.filter((p) => p.role.includes(role)).length;
					return (
						<StatChip
							key={role}
							num={count}
							colorClass={cls}
							label={role.replace(" Lead", "").replace(" Engineer", "")}
							labelClass="stat-chip-label--sm"
						/>
					);
				})}
			</div>

			{[...groups].map(([group, pages]) => (
				<PagesGroupSection
					key={group}
					group={group}
					pages={pages}
					openGroups={openGroups}
					toggleGroup={toggleGroup}
					open={open}
					setOpen={setOpen}
					expandedEps={expandedEps}
					setExpandedEps={setExpandedEps}
					highlightEndpointId={highlightEndpointId}
				/>
			))}
		</div>
	);
}
