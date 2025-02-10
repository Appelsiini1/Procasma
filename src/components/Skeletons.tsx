import { Skeleton, Stack, Typography } from "@mui/joy";

const CustomTextSkeleton = ({ children }: { children: React.ReactNode }) => (
  <Typography>
    <Skeleton animation="wave" sx={{ opacity: "50%" }}>
      {children}
    </Skeleton>
  </Typography>
);

export default function ListSkeleton() {
  return (
    <Stack sx={{ margin: "8px" }} gap="4px">
      <CustomTextSkeleton>
        Lorem ipsum is placeholder. Lorem ipsum is placeholder
      </CustomTextSkeleton>
      <CustomTextSkeleton>
        Lorem ipsum is placeholder. Lorem ipsum is placeholder
      </CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum is placeholder</CustomTextSkeleton>
      <CustomTextSkeleton>
        Lorem ipsum is placeholder. Lorem ipsum is placeholder
      </CustomTextSkeleton>
      <CustomTextSkeleton>
        Lorem ipsum is placeholder. Lorem ipsum is placeholder
      </CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum is placeholder</CustomTextSkeleton>
    </Stack>
  );
}

export function ListSkeletonSmall() {
  return (
    <Stack sx={{ margin: "8px" }} gap="4px">
      <CustomTextSkeleton>Lorem ipsum</CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum is placeholder</CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum is placeholder</CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum</CustomTextSkeleton>
      <CustomTextSkeleton>Lorem ipsum is placeholder</CustomTextSkeleton>
    </Stack>
  );
}
