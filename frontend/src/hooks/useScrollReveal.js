import { useEffect, useRef } from 'react';

/**
 * Custom hook using IntersectionObserver to trigger single-pass scroll reveal animations.
 * @param {Object} options Configuration options
 * @param {number} options.threshold Viewport visibility threshold (default 0.15 = 15%)
 * @param {string} options.rootMargin Root margin string (default '0px 0px -50px 0px')
 * @returns {React.RefObject} Ref to attach to the container element
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const items = container.querySelectorAll('.reveal-fade-up, .reveal-fade-side, .reveal-stagger-item, .reveal-fade-only');
      items.forEach(item => item.classList.add('revealed'));
      container.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const observeElements = () => {
      if (
        container.classList.contains('reveal-fade-up') ||
        container.classList.contains('reveal-fade-side') ||
        container.classList.contains('reveal-fade-only')
      ) {
        observer.observe(container);
      }

      const revealableChildren = container.querySelectorAll(
        '.reveal-fade-up, .reveal-fade-side, .reveal-stagger-item, .reveal-fade-only'
      );
      revealableChildren.forEach(child => observer.observe(child));
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold, rootMargin]);

  return containerRef;
}
