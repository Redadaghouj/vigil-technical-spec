import { useState, useCallback } from "react";

/**
 * Centralized open/closed registry for all collapsible sections (endpoint
 * cards, payload sections, used-by sections, nested page cards).
 *
 * Keys are plain strings built by callers — e.g.
 * "page:setup:ep:ep-auth-login:payload:Response" or
 * "ep:ep-auth-login:usedby:page:page-setup". There is no enforced schema;
 * `collapseMatching` just does a substring test, so callers own building
 * keys that (a) are unique per-instance and (b) share a recognisable
 * fragment (a page id, an endpoint id) that group-collapse can key off.
 *
 * @returns {[Set, (key: string) => boolean, (key: string) => void, (test: (key: string) => boolean) => void]}
 *   [openKeys, isOpen, toggle, collapseMatching]
 */
export default function useOpenState()
{
	const [openKeys, setOpenKeys] = useState(() => new Set());

	const isOpen = useCallback((key) => openKeys.has(key), [openKeys]);

	const toggle = useCallback((key) => setOpenKeys((prev) =>
	{
		const next = new Set(prev);
		next.has(key) ? next.delete(key) : next.add(key);
		return next;
	}), []);

	// Removes every currently-open key for which `test(key)` returns true.
	// Group-level "collapse all" buttons call this with a predicate that
	// matches keys belonging to that group (by id substring), collapsing
	// every open section at any nesting depth in one state update.
	const collapseMatching = useCallback((test) => setOpenKeys((prev) =>
	{
		let changed = false;
		const next = new Set(prev);
		for (const key of prev)
		{
			if (test(key))
			{
				next.delete(key);
				changed = true;
			}
		}
		return changed ? next : prev;
	}), []);

	return [openKeys, isOpen, toggle, collapseMatching];
}
