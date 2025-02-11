import { useContext, useEffect } from "react";
import { UIContext } from "../components/Context";
import AssignmentSelect from "../components/AssignmentSelect";

export default function AssignmentBrowse() {
  const { handleHeaderPageName } = useContext(UIContext);
  useEffect(() => {
    handleHeaderPageName("ui_assignment_browser");
  }, []);
  return (
    <>
      <AssignmentSelect useAsModalSelect={false} />
    </>
  );
}
