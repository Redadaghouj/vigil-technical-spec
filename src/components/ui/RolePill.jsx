/**
 * RolePill displays a role with appropriate styling.
 */
export default function RolePill({ role })
{
	const key = role.split(" +")[0].trim();
	const cls = "role--" + key.toLowerCase().replace(/\s+/g, "-");
	return (
		<span className={`role-pill ${cls}`}>
			{role}
		</span>
	);
}
