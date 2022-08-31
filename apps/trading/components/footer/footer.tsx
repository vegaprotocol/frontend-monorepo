import { Vega } from '../icons/vega';

export const Footer = () => {
  return (
    <footer className="px-4 py-2 text-xs border-t border-neutral-300 dark:border-neutral-700">
      <div className="flex justify-between">
        <div>Status</div>
        <Vega className="w-13" />
      </div>
    </footer>
  );
};
