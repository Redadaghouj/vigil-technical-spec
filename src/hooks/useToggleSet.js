import { useState, useCallback } from "react";

/**
 * Custom hook for managing a Set with toggle and ensure operations.
 * @param {Array} initial - Initial array of keys to populate the set
 * @returns {Array} [set, toggle, ensure] - The set, toggle function, and ensure function
 */
export default function useToggleSet(initial = [])
{
	const [set, setSet] = useState(() => new Set(initial));
	const toggle = useCallback(key => setSet(prev =>
	{
		const next = new Set(prev);
		next.has(key) ? next.delete(key) : next.add(key);
		return next;
	}), []);
	const ensure = useCallback(key => setSet(prev =>
		prev.has(key) ? prev : new Set([...prev, key])
	), []);
	return [set, toggle, ensure];
}
