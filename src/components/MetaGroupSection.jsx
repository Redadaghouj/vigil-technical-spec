import useBorderSpotlight from "../hooks/useBorderSpotlight.js";
import groupBy from "../utils/groupBy.js";
import MetaGroupHeader from "./ui/MetaGroupHeader.jsx";
import GroupSection from "./GroupSection.jsx";

/**
 * MetaGroupSection - A meta group section with border spotlight.
 * Pure pass-through: forwards registry props down to GroupSection.
 */
export default function MetaGroupSection({
	meta,
	eps,
	isOpen,
	onToggle,
	openGroups,
	toggleGroup,
	isOpenState,
	toggleOpenState,
	openKeys,
	collapseMatching,
	highlightId,
})
{
	const ref = useBorderSpotlight(!isOpen);
	const subGroups = groupBy(eps);

	// Whitelist: legend (header) or the bare fieldset (border) only — see
	// GroupSection.jsx for why a blacklist on `.collapsible` isn't safe
	// here (nested GroupSections have their own headers outside their own
	// `.collapsible`, which would otherwise wrongly bubble into a toggle).
	function handleFieldsetClick(e)
	{
		if (e.target === e.currentTarget || e.target.closest(".meta-group-hd")) {
			onToggle();
		}
	}

	return (
		<fieldset ref={ref} className="meta-group" onClick={handleFieldsetClick}>
			<MetaGroupHeader
				label={meta}
				count={eps.length}
				collapsed={!isOpen}
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
							isOpenState={isOpenState}
							toggleOpenState={toggleOpenState}
							openKeys={openKeys}
							collapseMatching={collapseMatching}
							highlightId={highlightId}
						/>
					))}
				</div>
			</div>
		</fieldset>
	);
}
