import { useLoaderData } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language, currentCourse } from "../constantsUI";
import { Typography } from "@mui/joy";
import PageHeaderBar from "../components/PageHeaderBar";

export default function Course() {
  let pageType = useLoaderData();
  //let pageType: string = null;
  let pageTitle: string = null;
  let enableCourseFolderSelect = true;

  if (pageType == "create") {
    pageTitle = texts.course_create[language.current];
  } else {
    pageTitle = currentCourse.ID + " " + currentCourse.title;
    enableCourseFolderSelect = false;
  }

  return (
    <>
      <PageHeaderBar pageName={texts.course_create[language.current]} />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
      </div>
    </>
  );
}
