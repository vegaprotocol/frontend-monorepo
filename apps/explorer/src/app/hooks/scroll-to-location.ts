import React from "react";
import { useLocation } from "react-router-dom";

// Source: https://scribe.rip/scrolling-to-an-anchor-in-react-when-your-elements-are-rendered-asynchronously-8c64f77b5f34
export const useScrollToLocation = () =>  {
    const scrolledRef = React.useRef(false);
    const { hash } = useLocation();
    const hashRef = React.useRef(hash);

    
    React.useEffect(() => {
      if (hash) {
        // We want to reset if the hash has changed
        if (hashRef.current !== hash) {
          hashRef.current = hash;
          scrolledRef.current = false;
        }
  
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
        element.scrollIntoView({ behavior: 'smooth' });

        scrolledRef.current = true;
        }
      }
    });
  };