import { useRef, useEffect, useState } from 'react';
/*
Title crawling mechanics

Goal
As the roadmap container scrolls horizontally, all project (and children?)
titles should move right to stay on screen until the entire project (child)
'bar' is off screen.

Details
Projects receive a ref to the container, suitable for watching for scroll
events. As a project receives events, it recalculates where its title is
relative to the screen and adds necessary css to nudge it to the right.
*/
export const useTitleCrawl = containerRef => {
  const titleRef = useRef(null);
  const [titlePadding, setTitlePadding] = useState(0);
  useEffect(() => {
    if (!containerRef.current) return;
    const currentRef = containerRef.current;

    const containerX = currentRef.getBoundingClientRect().x;
    const handleScroll = () => {
      const calculatedPadding = titleRef.current.getBoundingClientRect().x - containerX;
      const newPadding = calculatedPadding < 0 ? Math.abs(calculatedPadding) + 8 : 0;
      setTitlePadding(newPadding);
    };

    currentRef.addEventListener('scroll', handleScroll);
    return () => {
      if (!currentRef) return;
      currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);
  return [titleRef, titlePadding];
};
