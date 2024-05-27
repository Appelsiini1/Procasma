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

const imageSize = "38em";

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

        <Grid xs={5}>
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
