
import { useLocation } from 'react-router-dom';

export const useCanonicalUrl = () => {
  const location = useLocation();
  return `https://labdojo.io${location.pathname}`;
};
