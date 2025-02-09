import {
  Checkbox,
  IconButton,
  Sheet,
  Table,
  Select,
  Option,
  Typography,
  Stack,
} from "@mui/joy";
import { DropZoneFile, FileData, FileTypes } from "../types";
import DeleteIcon from "@mui/icons-material/Delete";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import ButtonComp from "./ButtonComp";
import { defaultFile } from "../defaultObjects";
import {
  deepCopy,
  getFileNameFromPath,
  getFileTypeUsingExtension,
} from "../rendererHelpers/utilityRenderer";
import { DropzoneComp } from "./DropzoneComp";
import log from "electron-log/renderer";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";

interface FileContentSelectProps {
  fileIndex: number;
  handleAttributeChange: (
    fileIndex: number,
    attribute: keyof FileData,
    value: string | boolean | FileTypes
  ) => void;
  defaultValue: string;
}

const tableHeadStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  borderBottom: "none",
};

/**
 * A drop-down selection window for the 'fileContent' attribute
 */
const FileContentSelect = ({
  fileIndex,
  handleAttributeChange,
  defaultValue,
}: FileContentSelectProps) => {
  const handleChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null
  ) => {
    handleAttributeChange(fileIndex, "fileContent", newValue);
  };

  return (
    <Select defaultValue={defaultValue} onChange={handleChange}>
      <Option value="instruction">{parseUICode("ui_instruction")}</Option>
      <Option value="result">{parseUICode("ui_result")}</Option>
      <Option value="code">{parseUICode("ui_code")}</Option>
      <Option value="data">{parseUICode("ui_data")}</Option>
      <Option value="other">{parseUICode("ui_other")}</Option>
    </Select>
  );
};

interface FileListProps {
  files: Array<FileData>;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
}

export default function FileList({
  files,
  handleAssignment,
  pathInAssignment,
}: FileListProps) {
  /**
   * Modify a file in the files list (in the assignment).
   */
  const handleAttributeChange = (
    fileIndex: number,
    attribute: keyof FileData,
    value: string | boolean | FileTypes
  ) => {
    const newFiles = [...files];
    newFiles[fileIndex] = { ...newFiles[fileIndex], [attribute]: value };

    handleAssignment(`${pathInAssignment}`, newFiles);
  };

  async function handleSelectFiles() {
    try {
      const filePaths: Array<string> = await handleIPCResult(() =>
        window.api.selectFiles()
      );

      if (filePaths.length < 1) {
        throw new Error("Select at least one file");
      }

      return filePaths;
    } catch (err) {
      log.error("Selected files not valid");
    }
    return null;
  }

  function handleSetFiles(newPaths: Array<string>) {
    const newFiles: FileData[] = newPaths.map((path) => {
      const newFile = deepCopy(defaultFile);
      newFile.path = path;
      newFile.fileName = getFileNameFromPath(path);

      const fileType = getFileTypeUsingExtension(path);
      newFile.fileType = fileType ? fileType : "text";
      return newFile;
    });

    const oldAndNewFiles = [...files, ...newFiles];

    handleAssignment(`${pathInAssignment}`, oldAndNewFiles);
  }

  async function handleDropZoneFiles(fileList: DropZoneFile[]) {
    const filePaths: string[] = await handleIPCResult(() =>
      window.api.saveCacheFiles(fileList)
    );
    handleSetFiles(filePaths);
  }

  const handleRemoveFile = (fileIndex: number) => {
    const newFiles = files.filter((_, i) => i !== fileIndex);

    handleAssignment(`${pathInAssignment}`, newFiles);
  };

  async function handleAddFiles() {
    const newPaths: Array<string> = await handleSelectFiles();

    if (!newPaths) {
      return;
    }

    handleSetFiles(newPaths);
    return;
  }

  return (
    <>
      <Sheet sx={{ border: "1px solid lightgrey", borderRadius: "8px" }}>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          sx={{
            padding: "0.5rem",
          }}
        >
          <Typography level="h4">{parseUICode("ui_files")}</Typography>
          <ButtonComp
            buttonType="normal"
            onClick={() => handleAddFiles()}
            ariaLabel={parseUICode("ui_aria_import_files")}
          >
            {parseUICode("ui_import_files")}
          </ButtonComp>
        </Stack>
        <Table borderAxis="xBetween" hoverRow>
          <thead>
            <tr>
              <th
                style={{
                  width: "20%",
                  ...tableHeadStyle,
                }}
              >
                {parseUICode("ui_name")}
              </th>
              <th style={{ ...tableHeadStyle }}>{parseUICode("ui_type")}</th>
              <th style={{ ...tableHeadStyle }}>
                {parseUICode("ui_fileContent")}
              </th>
              <th
                style={{
                  ...tableHeadStyle,
                }}
              >
                {parseUICode("ex_solution")}
              </th>
              <th
                style={{
                  ...tableHeadStyle,
                }}
              >
                {parseUICode("ui_show_to_student")}
              </th>
              <th
                style={{
                  ...tableHeadStyle,
                }}
              >
                {parseUICode("ui_actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, fileIndex) => (
              <tr key={file.path}>
                {/*<th scope="file">{file.fileName}</th>*/}
                <td
                  style={{
                    width: "30%",
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {file.fileName}
                </td>
                <td
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.fileType}
                </td>
                <td>
                  <FileContentSelect
                    fileIndex={fileIndex}
                    handleAttributeChange={handleAttributeChange}
                    defaultValue={file.fileContent}
                  ></FileContentSelect>
                </td>
                <td>
                  <Checkbox
                    checked={file.solution}
                    onChange={() =>
                      handleAttributeChange(
                        fileIndex,
                        "solution",
                        !file.solution
                      )
                    }
                  ></Checkbox>
                </td>
                <td>
                  <Checkbox
                    checked={file.showStudent}
                    onChange={() =>
                      handleAttributeChange(
                        fileIndex,
                        "showStudent",
                        !file.showStudent
                      )
                    }
                  ></Checkbox>
                </td>
                <td>
                  <IconButton onClick={() => handleRemoveFile(fileIndex)}>
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <DropzoneComp handleDropZoneFiles={handleDropZoneFiles}></DropzoneComp>
      </Sheet>
    </>
  );
}
