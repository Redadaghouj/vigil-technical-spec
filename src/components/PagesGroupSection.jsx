import useBorderSpotlight from "../hooks/useBorderSpotlight.js";
import GroupHeader from "./ui/GroupHeader.jsx";
import { PageCard } from "./EndpointComponents.jsx";

/**
 * PagesGroupSection - A group section with border spotlight for pages view
 * The ref is applied directly to the fieldset for the spotlight effect
 */
export default function PagesGroupSection({
	group,
	pages,
	openGroups,
	toggleGroup,
	open,
	setOpen,
	expandedEps,
	setExpandedEps,
	highlightEndpointId,
})
{
	const isCollapsed = !openGroups.has(group);
	const ref = useBorderSpotlight(isCollapsed);

	return (
		<fieldset ref={ref} className="group-section">
			<GroupHeader
				label={group}
				count={pages.length}
				collapsed={isCollapsed}
				onToggle={() => toggleGroup(group)}
			/>
			{!isCollapsed &&
				pages.map((page) =>
				{
					const isPageOpen = open === page.id;
					return (
						<PageCard
							key={page.id}
							page={page}
							isOpen={isPageOpen}
							onToggle={() => setOpen(isPageOpen ? null : page.id)}
							expandedEps={expandedEps}
							onToggleEp={(key) =>
								setExpandedEps((e) => ({ ...e, [key]: !e[key] }))
							}
							highlightEndpointId={highlightEndpointId}
						/>
					);
				})}
		</fieldset>
	);
}
