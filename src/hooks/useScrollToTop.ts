
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {    
    // Additional delayed scroll to handle late-loading content
    const timeouts = [
      setTimeout(() => window.scrollTo(0, 0), 10)
    ];
    
    // Cleanup function to clear timeouts if component unmounts or pathname changes
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [pathname]);
};
