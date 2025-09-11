
import { useLocation } from 'react-router-dom';

export const useCanonicalUrl = () => {
  const location = useLocation();
  return `https://learn-and-earn.online${location.pathname}`;
};
