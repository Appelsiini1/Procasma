import { Checkbox, IconButton, Sheet, Table, Select, Option } from "@mui/joy";
import texts from "../../resource/texts.json";
import { FileData, FileTypes } from "../types";
import DeleteIcon from "@mui/icons-material/Delete";
import { language } from "../globalsUI";
import { HandleAssignmentFn } from "../helpers/assignmentHelpers";
import ButtonComp from "./ButtonComp";
import { defaultFile } from "../myTestGlobals";
import {
  deepCopy,
  getFileNameFromPath,
  getFileTypeUsingExtension,
} from "../helpers/utility";

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
    const filePaths: Array<string> = window.api.selectFiles();

    if (!filePaths) {
      throw new Error("Selected files not valid");
    }

    if (filePaths?.length) {
      throw new Error("Select at least one file");
    }

    return filePaths;
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
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
      <Option value="instruction">
        {texts.ui_instruction[language.current]}
      </Option>
      <Option value="result">{texts.ui_result[language.current]}</Option>
      <Option value="code">{texts.ui_code[language.current]}</Option>
      <Option value="data">{texts.ui_data[language.current]}</Option>
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

  async function handleAddFile() {
    const newPaths: Array<string> = await handleSelectFiles();

    if (!newPaths) {
      return;
    }

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

  return (
    <>
      <ButtonComp
        buttonType="normal"
        onClick={() => handleAddFile()}
        ariaLabel={texts.ui_aria_import_files[language.current]}
      >
        {texts.ui_import_files[language.current]}
      </ButtonComp>

      <div className="emptySpace1" />
      <Sheet>
        <Table borderAxis="xBetween" hoverRow>
          <thead>
            <tr>
              <th>{texts.ui_name[language.current]}</th>
              <th>{texts.ui_type[language.current]}</th>
              <th>{texts.ui_fileContent[language.current]}</th>
              <th>{texts.ex_solution[language.current]}</th>
              <th>{texts.ui_show_to_student[language.current]}</th>
              <th>{texts.ui_actions[language.current]}</th>
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
      </Sheet>
    </>
  );
}
