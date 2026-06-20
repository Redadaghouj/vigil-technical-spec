import useBorderSpotlight from "../hooks/useBorderSpotlight.js";
import groupBy from "../utils/groupBy.js";
import MetaGroupHeader from "./ui/MetaGroupHeader.jsx";
import GroupSection from "./GroupSection.jsx";

/**
 * MetaGroupSection - A meta group section with border spotlight
 * The ref is applied directly to the fieldset for the spotlight effect
 */
export default function MetaGroupSection({
	meta,
	eps,
	isOpen,
	onToggle,
	openGroups,
	toggleGroup,
	expanded,
	setExpanded,
	highlightId,
})
{
	const ref = useBorderSpotlight(!isOpen);
	const subGroups = groupBy(eps);

	return (
		<fieldset ref={ref} className="meta-group">
			<MetaGroupHeader
				label={meta}
				count={eps.length}
				collapsed={!isOpen}
				onToggle={onToggle}
			/>
			<div className={"collapsible" + (isOpen ? " collapsible--open" : "")}>
				<div className="collapsible-inner">
					{[...subGroups].map(([group, groupEps]) => (
						<GroupSection
							key={group}
							group={group}
							groupEps={groupEps}
							openGroups={openGroups}
							toggleGroup={toggleGroup}
							expanded={expanded}
							setExpanded={setExpanded}
							highlightId={highlightId}
						/>
					))}
				</div>
			</div>
		</fieldset>
	);
}
