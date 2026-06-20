/**
 * GroupHeader displays a collapsible group header with label and count.
 */

export default function GroupHeader({ label, count, collapsed, onToggle })
{
	return (
		<legend className="group-hd" onClick={onToggle}>
			<span className="group-hd-label-wrap">
				<span className="group-hd-label">{label}</span>
				<span className="group-hd-count">{count}</span>
			</span>
			<span className="group-hd-toggle">{collapsed ? "→" : "↓"}</span>
		</legend>
	);
}
