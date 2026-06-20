/**
 * MetaGroupHeader displays a collapsible meta group header for visibility sections.
 */

export default function MetaGroupHeader({
	label,
	count,
	collapsed,
	onToggle
})
{
	return (
		<legend className={"meta-group-hd meta-group-hd--" + label.toLowerCase()} onClick={onToggle}>
			<span className={label.toLowerCase()} />
			<span className="meta-group-label-wrap">
				<span className="meta-group-label">{label}</span>
				<span className="meta-group-count">{count}</span>
			</span>
			<span className="meta-group-toggle">
				{collapsed ? "→" : "↓"}
			</span>
		</legend>
	);
}
