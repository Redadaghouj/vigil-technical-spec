import { useMemo } from "react";
import useBorderSpotlight from "../hooks/useBorderSpotlight.js";
import GroupHeader from "./ui/GroupHeader.jsx";
import { EndpointCard } from "./EndpointComponents.jsx";

/**
 * GroupSection - A group section with border spotlight for the Endpoints view.
 *
 * Each EndpointCard's openKey is "ep:" + ep.id — unique per endpoint globally,
 * so belongsToGroup can match by id substring across all nesting depths
 * (payload sections, used-by toggles, nested page cards).
 *
 * Collapse-all button: wipes every open registry key that belongs to any
 * endpoint in this group, collapsing payloads, used-by sections, and nested
 * page cards in one state update. Only shown once at least 2 of those keys
 * are actually open — with 0 or 1 expanded there's nothing meaningful to
 * collapse "all" of.
 */
export default function GroupSection({
	group,
	groupEps,
	openGroups,
	toggleGroup,
	isOpenState,
	toggleOpenState,
	openKeys,
	collapseMatching,
	highlightId,
})
{
	const isCollapsed = !openGroups.has(group);
	const ref = useBorderSpotlight(isCollapsed);

	// A key belongs to this group if it contains any endpoint id from the group.
	const epIds = groupEps.map((ep) => ep.id);
	const belongsToGroup = (key) => epIds.some((id) => key.includes(id));

	const openCount = useMemo(
		() => [...openKeys].filter(belongsToGroup).length,
		[openKeys, groupEps],
	);

	function handleCollapseAll()
	{
		collapseMatching(belongsToGroup);
	}

	// Single source of truth for "click to toggle": fires for clicks on the
	// legend (header) or directly on the bare fieldset (the border area —
	// the spotlight border itself is a pointer-events:none clone, so a
	// click there falls through to this fieldset underneath it). Deliberately
	// a WHITELIST rather than excluding `.collapsible`: nested content can
	// have its own headers/toggles that live outside their own `.collapsible`
	// wrapper (e.g. a page card's header), and those would wrongly bubble
	// into a group toggle under a blacklist approach.
	function handleFieldsetClick(e)
	{
		if (e.target.closest(".group-hd-collapse-btn")) return;
		if (e.target === e.currentTarget || e.target.closest(".group-hd")) {
			toggleGroup(group);
		}
	}

	return (
		<fieldset ref={ref} className="group-section" key={group} onClick={handleFieldsetClick}>
			<GroupHeader
				label={group}
				count={groupEps.length}
				collapsed={isCollapsed}
				onCollapseAll={handleCollapseAll}
				collapseAllActive={!isCollapsed && openCount >= 2}
			/>
			<div className={"collapsible" + (!isCollapsed ? " collapsible--open" : "")}>
				<div className="collapsible-inner">
					{groupEps.map((ep) => (
						<EndpointCard
							key={ep.id}
							ep={ep}
							openKey={"ep:" + ep.id}
							isOpenState={isOpenState}
							toggleOpenState={toggleOpenState}
							highlighted={highlightId === ep.id}
							openKeys={openKeys}
							collapseMatching={collapseMatching}
						/>
					))}
				</div>
			</div>
		</fieldset>
	);
}
