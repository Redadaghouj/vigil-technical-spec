/**
 * SidebarMetaHeader displays a collapsible meta group header in the sidebar.
 */

export default function SidebarMetaHeader({ label, open, onToggle })
{
	return (
		<div className="sidebar-meta-hd" onClick={onToggle}>
			<span className={label.toLowerCase()} />
			{label}
			<span className="sidebar-meta-toggle">
				{open ? "−" : "+"}
			</span>
		</div>
	);
}
