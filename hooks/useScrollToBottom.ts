import { useEffect, useRef, RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(
    dependency: any
): RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [dependency]);

    return ref;
}