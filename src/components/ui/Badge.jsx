/**
 * Badge component displays HTTP method with appropriate styling.
 */
export default function Badge({ method })
{
	return (
		<span className={`badge badge--${method.toLowerCase()}`}>
			{method}
		</span>
	);
}
