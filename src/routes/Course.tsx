import { useLoaderData } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language, currentCourse } from "../constantsUI";
import { Grid, IconButton, Table, Typography } from "@mui/joy";
import PageHeaderBar from "../components/PageHeaderBar";
import InputField from "../components/InputField";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Dropdown from "../components/Dropdown";

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

  function handleFolderOpen() {
    console.log("Folder open");
  }

  return (
    <>
      <PageHeaderBar pageName={texts.course_create[language.current]} />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="cID">
              <td>
                <Typography level="h4">
                  {texts.ui_course_id[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="cIDInput" />
              </td>
            </tr>
            <tr key="cName">
              <td>
                <Typography level="h4">
                  {texts.ui_course_name[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="cNameInput" />
              </td>
            </tr>
            <tr key="cFolder">
              <td>
                <Typography level="h4">
                  {texts.ui_course_folder[language.current]}
                </Typography>
              </td>
              <td>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid xs={10}>
                    <InputField fieldKey="cFolderInput" />
                  </Grid>
                  <Grid xs={2}>
                    <IconButton
                      sx={{
                        backgroundColor: "#F8A866",
                        "&:hover": { backgroundColor: "#F68C35" },
                      }}
                      onClick={() => handleFolderOpen()}
                    >
                      <FolderOpenIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </td>
            </tr>
            <tr key="cModuleType">
              <td>
                <Typography level="h4">
                  {texts.ui_module_type[language.current]}
                </Typography>
              </td>
              <td>{/* <Dropdown name="cModuleTypeInput"></Dropdown> */}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </>
  );
}
