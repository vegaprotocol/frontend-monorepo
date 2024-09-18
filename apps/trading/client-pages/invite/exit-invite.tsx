import { Navigate } from 'react-router-dom';
import { Links } from '../../lib/links';

export const ExitInvite = () => <Navigate to={Links.MARKETS()} />;
