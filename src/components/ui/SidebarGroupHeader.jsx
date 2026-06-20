/**
 * SidebarGroupHeader displays a collapsible group header in the sidebar.
 */

export default function SidebarGroupHeader({ label, count, open, onToggle })
{
	return (
		<div className="sidebar-group-hd" onClick={onToggle}>
			<span className="sidebar-group-label">{label}</span>
			<span className="sidebar-group-meta">
				{!open ? `${count} ▸` : "−"}
			</span>
		</div>
	);
}
