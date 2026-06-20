/**
 * VisibilityBadge displays whether an endpoint is internal or external.
 */
export default function VisibilityBadge({ internal })
{
	return (
		<span className={`visibility-badge visibility-badge--${internal ? "int" : "ext"}`}>
			{internal ? "Internal" : "External"}
		</span>
	);
}
