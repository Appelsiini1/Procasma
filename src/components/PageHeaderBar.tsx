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
import { useEffect, useState } from "react";
import { refreshTitle } from "../rendererHelpers/requests";
import { parseUICode } from "../rendererHelpers/translation";

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
  loading?: boolean;
};

export default function PageHeaderBar({
  pageName,
  courseID,
  courseTitle,
  loading,
}: ComponentProps) {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState(null);

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

  useEffect(() => {
    refreshTitle();
  }, []);

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
              {pageName}
            </Typography>
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

        <Grid xs={1} display="flex" justifyContent="center">
          <Box
            sx={{
              bgcolor: "#FFFFF",
              marginTop: "auto",
              marginBottom: "auto",
              width: "100%",
            }}
          >
            {loading ? <LinearProgress /> : null}
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
