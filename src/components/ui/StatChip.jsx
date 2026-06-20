/**
 * StatChip displays a statistic with a number and label.
 */
export default function StatChip({ colorClass, num, label, labelClass })
{
	return (
		<div className="stat-chip">
			<span className={`stat-chip-num ${colorClass || ""}`}>{num}</span>
			<span className={`stat-chip-label ${labelClass || ""}`}>{label}</span>
		</div>
	);
}
