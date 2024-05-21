import { Box, Divider, IconButton, Stack, Typography } from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import Logo from "../../resource/Logo.png";
import Grid from "@mui/joy/Grid";
import { useNavigate } from "react-router-dom";

const IconSX = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
};

const imageSize = "40em";

type ButtonProps = {
  pageName: string;
  courseName: string;
};

export default function PageHeaderBar({ pageName, courseName }: ButtonProps) {
  //const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        backgroundColor: "#F8A866",
        minHeight: "3.5rem",
      }}
    >
      <Grid
        container
        spacing={3}
        sx={{ flexGrow: 1 }}
        justifyContent="center"
        alignItems="center"
      >
        <Grid xs>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{
              marginLeft: "1em",
              justifyContent: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            <IconButton
              size="lg"
              sx={IconSX}
              onClick={() => {
                //navigate(-1);
              }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="lg"
              sx={IconSX}
              onClick={() => {
                //navigate('/');
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
            <Typography level="h3">{pageName}</Typography>
          </Stack>
        </Grid>
        <Grid xs={1} display="flex">
          <Box
            sx={{
              bgcolor: "#FFFFF",
              maxHeight: "1em",
              marginTop: "0%",
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

        <Grid xs display="flex" justifyItems="right">
          <Typography
            level="h4"
            sx={{
              marginRight: "0.8em",
              justifyContent: "right",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            {courseName}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
