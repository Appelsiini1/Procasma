import { Step, StepIndicator, Stepper } from "@mui/joy";

type StepperCompProps = {
  stepperState: number;
  headings: string[];
};

const StepComp = ({
  index,
  active,
  text,
}: {
  index: number;
  active: boolean;
  text: string;
}) => {
  return (
    <Step
      indicator={
        <StepIndicator variant={active ? "solid" : undefined}>
          {index}
        </StepIndicator>
      }
    >
      {text}
    </Step>
  );
};

export default function StepperComp({
  stepperState,
  headings,
}: StepperCompProps) {
  return (
    <Stepper sx={{ width: "100%" }}>
      {headings.map((heading, index) => (
        <StepComp
          key={index}
          index={index + 1}
          active={index === stepperState ? true : false}
          text={heading}
        ></StepComp>
      ))}
    </Stepper>
  );
}
