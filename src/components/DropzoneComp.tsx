import { useDropzone } from "react-dropzone";
import { CSSProperties, useCallback, useMemo } from "react";
import { Typography } from "@mui/material";
import { parseUICode } from "../rendererHelpers/translation";

/**
 * Dropzone component for files
 */
export const DropzoneComp = ({
  handleSetFiles,
}: {
  handleSetFiles: (newPaths: Array<string>) => void;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length) {
        // add accepted files
        const filePaths: Array<string> = acceptedFiles.map((file: File) => {
          return file.path;
        });

        handleSetFiles(filePaths);
      }
    },
    [handleSetFiles]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop,
    noClick: true,
  });

  const baseStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    width: "calc(100% - 15px)",
    height: "138px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    borderWidth: 3,
    borderRadius: 8,
    borderColor: "#F8A866",
    borderStyle: "dashed",
    backgroundColor: "#EEEEEE",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
  };

  const focusedStyle = { borderColor: "#66B6F8" };
  const acceptStyle = { borderColor: "#66B6F8" };
  const rejectStyle = { borderColor: "#66B6F8" };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject, acceptStyle]
  );

  return (
    <div>
      <div>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography variant="body1">
              <span>{parseUICode("ui_dropzone_text_hover")}</span>
            </Typography>
          ) : (
            <Typography variant="body1">
              <span>{parseUICode("ui_dropzone_text_default")}</span>
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
