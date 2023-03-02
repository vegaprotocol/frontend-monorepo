import { useTranslation } from 'react-i18next';

const SplashSpan = ({ className }: { className: string }) => (
  <span className={`${className} block w-8 bg-white`} />
);

export const SplashError = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex flex-col gap-12 items-center mb-20">
        <SplashSpan className={'h-28'} />
        <SplashSpan className={'h-8'} />
      </div>
      {t('networkDown')}
    </div>
  );
};
