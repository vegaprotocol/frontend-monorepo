import * as React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t, useScreenDimensions } from '@vegaprotocol/react-helpers';
import { Counter } from './counter';

export type TStep = {
  label: string;
  component: ReactNode;
  disabled?: boolean;
  value?: string;
};

export interface StepperProps {
  steps: TStep[];
  className?: string;
}

export const Stepper = ({ steps }: StepperProps) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const lastStep = steps.length - 1;
  const isLastStep = activeStep === lastStep;
  const { isMobile } = useScreenDimensions();

  const handleClick = (index: typeof activeStep) => {
    setActiveStep(index);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' && activeStep > 0) {
      return setActiveStep((prevActiveStep) => prevActiveStep - 1);
    } else if (event.key === 'ArrowRight' && !isLastStep) {
      return setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    return false;
  };

  const handleNext = () => {
    if (!isLastStep) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  return (
    <div>
      <ol
        aria-label={t('Step by step to make a trade')}
        className="relative flex md:flex-col justify-between list-none"
      >
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isFirstStep = !index;
          const isLastStep = lastStep === index;
          return (
            <li
              className="flex-1"
              key={`${index}-${step.label}`}
              aria-label={t(`Step ${index + 1}`)}
            >
              <div className="flex relative md:pt-16">
                {!isFirstStep ? (
                  <div
                    aria-hidden
                    className="flex-auto absolute top-[20px] -left-1/2 right-1/2 md:-top-1/2 md:bottom-1/2 md:left-[29.5px] md:right-auto"
                  >
                    <span className="h-full block border-t-1 border-black dark:border-white w-full md:border-l-1 md:border-t-0" />
                  </div>
                ) : undefined}
                <button
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  id={`step-${index}-control`}
                  aria-controls={`step-${index}-panel`}
                  onKeyDown={(event) => handleKeyPress(event)}
                  onClick={() => handleClick(index)}
                  className="cursor-pointer z-10 flex w-full items-center"
                >
                  <div className="flex-1 flex flex-col md:flex-row items-center w-full text-center">
                    <Counter
                      className="md:mr-16"
                      isActive={isActive}
                      label={(index + 1).toString()}
                    />
                    <h3
                      className={classNames(
                        'md:mt-0 font-alpha uppercase text-black dark:text-white',
                        {
                          'mt-8 text-md md:text-2xl': isActive,
                          'mt-16 text-sm md:text-md ml-8': !isActive,
                        }
                      )}
                    >
                      {step.label}
                    </h3>
                  </div>
                  {step.value && !isActive && (
                    <span
                      aria-label={`Selected value ${step.value}`}
                      className="text-blue hidden md:block"
                    >
                      {step.value}
                    </span>
                  )}
                </button>
              </div>
              {!isMobile && (
                <div
                  /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                  tabIndex={0}
                  id={`step-${index}-panel`}
                  aria-labelledby={`step-${index}-control`}
                  aria-hidden={!isActive}
                  role="tabpanel"
                  className={classNames(
                    'hidden md:block md:border-black md:dark:border-white md:ml-[29.5px] md:pl-[45px]',
                    {
                      'invisible h-0': !isActive,
                      'visible h-full': isActive,
                      'md:border-l': !isLastStep,
                    }
                  )}
                >
                  {step.component}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {isMobile && (
        <div
          id={`step-${activeStep}-panel`}
          aria-labelledby={`step-${activeStep}-control`}
          role="tabpanel"
          className="md:hidden mt-32" // md:hidden as fallback
          /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
          tabIndex={0}
        >
          {steps[activeStep].component}
          {!isLastStep && (
            <Button
              className="w-full !py-8 mt-64 md:sr-only"
              boxShadow={false}
              variant="secondary"
              onClick={handleNext}
              disabled={steps[activeStep].disabled}
            >
              {t('Next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
