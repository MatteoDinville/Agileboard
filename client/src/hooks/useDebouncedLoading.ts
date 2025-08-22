import { useEffect, useState } from "react";

export function useDebouncedLoading(isLoading: boolean, delayMs = 150) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (isLoading) {
			const t = setTimeout(() => setShow(true), delayMs);
			return () => clearTimeout(t);
		} else {
			setShow(false);
		}
	}, [isLoading, delayMs]);

	return show;
}
