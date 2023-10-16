import { useNavigate } from 'react-router-dom';
import { Links } from '../../lib/links';

export const useMarketClickHandler = (replace = false) => {
  const navigate = useNavigate();

  return (selectedId: string, metaKey?: boolean) => {
    const link = Links.MARKET(selectedId);
    if (metaKey) {
      window.open(`/#${link}`, '_blank');
    } else {
      navigate(link, { replace });
    }
  };
};

export const useNavigateWithMeta = (replace = false) => {
  const navigate = useNavigate();

  return (link: string, metaKey?: boolean) => {
    if (metaKey) {
      window.open(`/#${link}`, '_blank');
    } else {
      navigate(link, { replace });
    }
  };
};
