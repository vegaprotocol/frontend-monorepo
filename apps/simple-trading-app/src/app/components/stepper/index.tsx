import * as React from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Button } from '@vegaprotocol/ui-toolkit';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

type Step = {
  label: string;
  description: string;
  component: ReactNode;
  disabled?: boolean;
};

interface StepperProps {
  steps: Step[];
}

export default ({ steps }: StepperProps) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleClick = (index: typeof activeStep) => {
    setActiveStep(index);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Paper square elevation={1} sx={{ p: 3, mt: 5 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(index)}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography sx={{ mb: 2 }}>{step.description}</Typography>
              {step.component}
              <Divider sx={{ mb: 2 }} />
              <Box>
                <div>
                  <Button
                    variant="secondary"
                    onClick={handleNext}
                    disabled={step.disabled}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    variant="inline"
                    disabled={index === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset}>Reset</Button>
        </Paper>
      )}
    </Paper>
  );
};
