/**
 * GroupHeader displays a collapsible group header with label, count, and a
 * "collapse all" button.
 *
 * The button is always mounted; `collapseAllActive` controls its `disabled`
 * state rather than the button entering/leaving the DOM. That reserves its
 * height permanently, so the header's own height never changes (and never
 * shifts the page below it down) when collapse-all becomes available —
 * see the `:disabled` rule in App.css.
 *
 * Note: this component carries no click-to-toggle handlers of its own. The
 * containing wrapper div (see GroupSection / PagesGroupSection) owns a
 * single click handler — a WHITELIST that fires only for clicks on the
 * legend (header), the wrapper's own padding, or directly on the bare
 * fieldset (the synthetic spotlight border is a pointer-events:none clone,
 * so clicks there fall through to the real fieldset underneath), explicitly
 * excluding `.group-hd-collapse-btn` (this button). That covers the label,
 * the toggle arrow, AND the border with one source of truth — instead of
 * three separate handlers that could drift out of sync.
 */
export default function GroupHeader({
	label,
	count,
	collapsed,
	onCollapseAll,
	collapseAllActive
})
{
	return (
		<legend className="group-hd">
			<span className="group-hd-label-wrap">
				<span className="group-hd-label">{label}</span>
				<span className="group-hd-count">{count}</span>
			</span>
			<span className="group-hd-toggle">{collapsed ? "→" : "↓"}</span>
			<button
				type="button"
				className="group-hd-collapse-btn"
				onClick={onCollapseAll}
				disabled={!collapseAllActive}
				title="Collapse all"
			>
				Collapse all
			</button>
		</legend>
	);
}
