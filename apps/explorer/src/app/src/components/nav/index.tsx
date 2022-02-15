import { Link } from 'react-router-dom';
import routerConfig from '../../routes/router-config';

export const Nav = () => {
  return (
    <nav>
      {routerConfig.map((r) => (
        <div key={r.name}>
          {/* TODO stupid hack */}
          <Link to={r.path.replace('/*', '')}>{r.name}</Link>
          <br />
        </div>
      ))}
    </nav>
  );
};
