import {
  Box,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import Logo from "../../resource/Logo.png";
import Grid from "@mui/joy/Grid";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { parseUICode } from "../rendererHelpers/translation";
import { UIContext } from "./Context";
import HelpText from "./HelpText";
import { ForceToString } from "../generalHelpers/converters";

const IconSX = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
};

const imageSize = "38em";

type ComponentProps = {
  pageName: string;
  courseID: string;
  courseTitle: string;
  IPCOperationLoading?: boolean;
  IPCStack: string[];
};

export default function PageHeaderBar() {
  const {
    pageName,
    courseID,
    courseTitle,
    IPCOperationLoading,
    IPCStack,
  }: ComponentProps = useContext(UIContext);
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState(null);
  const IPCLoadingText = `IPC ${parseUICode("ui_processes")}: 
    ${ForceToString(IPCStack)}`;

  const handleCourseName = (ID: string, title: string) => {
    if (ID && title) {
      setCourseName(`${ID} ${title}`);
    } else {
      setCourseName(parseUICode("ui_no_course"));
    }
  };

  useEffect(() => {
    handleCourseName(courseID, courseTitle);
  }, [courseID, courseTitle]);

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        backgroundColor: "#F8A866",
        minHeight: "3.5rem",
        boxShadow: "0px 1px 3px 3px rgb(0 0 0 / 20%)",
        position: "sticky",
        top: "0",
        zIndex: "999",
      }}
    >
      <Grid
        container
        sx={{ flexGrow: 1 }}
        justifyContent="space-around"
        alignItems="stretch"
      >
        <Grid xs={5}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{
              marginLeft: "1em",
              justifyContent: "left",
              marginTop: ".4em",
              marginBottom: "auto",
            }}
          >
            <IconButton
              size="lg"
              sx={IconSX}
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="lg"
              sx={IconSX}
              onClick={() => {
                navigate("/");
              }}
            >
              <HomeIcon fontSize="large" />
            </IconButton>
            <Box>
              <Divider
                orientation="vertical"
                sx={{
                  width: "0.2em",
                  backgroundColor: "#000000",
                  height: "2em",
                  justifyContent: "center",
                  marginLeft: "0.3em",
                }}
              />
            </Box>
            <Box />
            <Typography level="h3" noWrap>
              {parseUICode(pageName)}
            </Typography>
            <Box />
            {IPCOperationLoading ? <LinearProgress /> : null}
            <Box />
            {IPCOperationLoading ? (
              <>
                <Typography level="body-lg" noWrap>
                  {IPCStack.length}
                </Typography>
                <HelpText text={IPCLoadingText} />
              </>
            ) : (
              ""
            )}
          </Stack>
        </Grid>

        <Grid xs={2} display="flex" justifyContent="center">
          <Box
            sx={{
              bgcolor: "#FFFFF",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            <img
              src={Logo}
              className="logoImage"
              width={imageSize}
              height={imageSize}
            />
          </Box>
        </Grid>

        <Grid xs={4}>
          <Typography
            level="h4"
            noWrap
            sx={{
              marginTop: ".5em",
              marginBottom: "auto",
              marginRight: "1em",
              textAlign: "right",
            }}
          >
            {courseName}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
