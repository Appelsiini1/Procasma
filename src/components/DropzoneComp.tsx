import { useDropzone, FileWithPath } from "react-dropzone";
import { CSSProperties, useCallback, useMemo } from "react";
import { Typography } from "@mui/material";
import { parseUICode } from "../rendererHelpers/translation";
import log from "electron-log/renderer";
import { DropZoneFile } from "../types";

/**
 * Dropzone component for files
 */
export const DropzoneComp = ({
  handleDropZoneFiles,
}: {
  handleDropZoneFiles: (newPaths: Array<DropZoneFile>) => void;
}) => {
  const reader = (file: File) =>
    new Promise<DropZoneFile>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () =>
        resolve({ fileContent: fr.result as ArrayBuffer, fileName: file.name });
      fr.onerror = (err) => reject(err);
      fr.readAsArrayBuffer(file);
    });

  async function loadFiles(fileList: File[]) {
    let fileResults: Array<DropZoneFile> = [];
    const frPromises = fileList.map(reader);

    try {
      fileResults = await Promise.all(frPromises);
    } catch (err) {
      // In this specific case, Promise.all() might be preferred
      // over Promise.allSettled(), since it isn't trivial to modify
      // a FileList to a subset of files of what the user initially
      // selected. Therefore, let's just stash the entire operation.
      log.error(err);
      throw err;
    }
    handleDropZoneFiles(fileResults);
  }

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles?.length) {
        // add accepted files
        const fileList: File[] = [];
        for (const file of acceptedFiles) {
          fileList.push(await file.handle.getFile());
        }
        loadFiles(fileList);
      }
    },
    [handleDropZoneFiles]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    /*@ts-ignore */
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
