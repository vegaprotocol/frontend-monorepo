import { useEffect, useState } from 'react';

type State = 'idle' | 'loading' | 'ready' | 'error';

// keep record of loaded script state, so if the component re-mounts but the script
// was already appended its not re-appended and will have the correct state
type Url = string;
const cache: Record<Url, State> = {};

export const useScript = (url: string, integrity: string) => {
  // track state of the script as it loads or possibly fails
  const [state, setState] = useState<State>(url ? 'loading' : 'idle');

  useEffect(() => {
    if (!url) {
      setState('idle');
      return;
    }

    // Use the integrity hash of the script as an identifier
    let script = document.getElementById(integrity) as HTMLScriptElement | null;

    if (script) {
      // script already on the page
      setState(cache[url]);
    } else {
      // script not found, create and append script
      script = document.createElement('script');
      script.id = integrity;
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous'; // make sure sri is respected with cross origin request
      script.integrity = `sha256-${integrity}`;

      document.body.appendChild(script);
    }

    // Setup/teardown listeners to notify component when script has loaded
    const _setState = (event: Event) => {
      const result = event.type === 'load' ? 'ready' : 'error';
      setState(result);
      cache[url] = result;
    };

    script.addEventListener('load', _setState);
    script.addEventListener('error', _setState);

    return () => {
      if (script) {
        script.removeEventListener('load', _setState);
        script.removeEventListener('error', _setState);
      }
    };
  }, [url, integrity]);

  return state;
};
