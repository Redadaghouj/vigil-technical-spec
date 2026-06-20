import useBorderSpotlight from "../hooks/useBorderSpotlight.js";
import GroupHeader from "./ui/GroupHeader.jsx";
import { EndpointCard } from "./EndpointComponents.jsx";

/**
 * GroupSection - A group section with border spotlight
 * The ref is applied directly to the fieldset for the spotlight effect
 */
export default function GroupSection({
	group,
	groupEps,
	openGroups,
	toggleGroup,
	expanded,
	setExpanded,
	highlightId,
})
{
	const isCollapsed = !openGroups.has(group);
	const ref = useBorderSpotlight(isCollapsed);

	return (
		<fieldset ref={ref} className="group-section" key={group}>
			<GroupHeader
				label={group}
				count={groupEps.length}
				collapsed={isCollapsed}
				onToggle={() => toggleGroup(group)}
			/>
			<div className={"collapsible" + (!isCollapsed ? " collapsible--open" : "")}>
				<div className="collapsible-inner">
					{groupEps.map((ep) => (
						<EndpointCard
							key={ep.id}
							ep={ep}
							expanded={!!expanded[ep.id]}
							onToggle={() => setExpanded((e) => ({
								...e,
								[ep.id]: !e[ep.id]
							}))}
							highlighted={highlightId === ep.id}
						/>
					))}
				</div>
			</div>
		</fieldset>
	);
}
