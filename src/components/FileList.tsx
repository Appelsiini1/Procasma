import { Checkbox, IconButton, Sheet, Table, Select, Option } from "@mui/joy";
import { FileData, FileTypes } from "../types";
import DeleteIcon from "@mui/icons-material/Delete";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import ButtonComp from "./ButtonComp";
import { defaultFile } from "../defaultObjects";
import {
  deepCopy,
  getFileNameFromPath,
  getFileTypeUsingExtension,
} from "../rendererHelpers/utility";
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
      <ButtonComp
        buttonType="normal"
        onClick={() => handleAddFiles()}
        ariaLabel={parseUICode("ui_aria_import_files")}
      >
        {parseUICode("ui_import_files")}
      </ButtonComp>

      <div className="emptySpace1" />
      <Sheet>
        <Table borderAxis="xBetween" hoverRow>
          <thead>
            <tr>
              <th>{parseUICode("ui_name")}</th>
              <th>{parseUICode("ui_type")}</th>
              <th>{parseUICode("ui_fileContent")}</th>
              <th>{parseUICode("ex_solution")}</th>
              <th>{parseUICode("ui_show_to_student")}</th>
              <th>{parseUICode("ui_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, fileIndex) => (
              <tr key={file.path}>
                {/*<th scope="file">{file.fileName}</th>*/}
                <td>{file.fileName}</td>
                <td>{file.fileType}</td>
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

        <div className="emptySpace1" />
        <DropzoneComp handleSetFiles={handleSetFiles}></DropzoneComp>
      </Sheet>
    </>
  );
}
