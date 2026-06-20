/**
 * Groups an array of items by a specified key.
 * @param {Array} items - Array of items to group
 * @param {string} key - Key to group by (default: "group")
 * @returns {Map} Map of group names to arrays of items
 */
export default function groupBy(items, key = "group")
{
	return items.reduce((map, s) =>
	{
		const g = s[key] || "Ungrouped";
		return map.set(g, [...(map.get(g) || []), s]);
	}, new Map());
}
