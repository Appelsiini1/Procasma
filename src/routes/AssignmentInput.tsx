import { useContext, useEffect } from "react";
import AssignmentEdit from "../components/AssignmentEdit";
import { UIContext } from "../components/Context";

export default function AssignmentInput() {
  const { handleHeaderPageName } = useContext(UIContext);
  useEffect(() => {
    handleHeaderPageName("ui_add_assignment");
  }, []);
  return (
    <>
      <AssignmentEdit useAsModalSelect={false} />
    </>
  );
}
