import { Checkbox, IconButton, Sheet, Table, Select, Option } from "@mui/joy";
import texts from "../../resource/texts.json";
import { FileData, FileTypes } from "../types";
import DeleteIcon from "@mui/icons-material/Delete";
import { language } from "../constantsUI";
import { useState } from "react";

interface FileContentSelectProps {
  fileName: string;
  handleAttributeChange: (
    fileName: string,
    attribute: keyof FileData,
    value: string | boolean | FileTypes
  ) => void;
}

/**
 * A drop-down selection window for the 'fileContent' attribute
 */
const FileContentSelect = ({
  fileName,
  handleAttributeChange,
}: FileContentSelectProps) => {
  const handleChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null
  ) => {
    handleAttributeChange(fileName, "fileContent", newValue);
  };

  return (
    <Select defaultValue="instruction" onChange={handleChange}>
      <Option value="instruction">
        {texts.ui_instruction[language.current]}
      </Option>
      <Option value="result">{texts.ui_result[language.current]}</Option>
      <Option value="code">{texts.ui_code[language.current]}</Option>
      <Option value="data">{texts.ui_data[language.current]}</Option>
    </Select>
  );
};

/**
 * Currently sets 'rows' prop as the default state, then handles the state
 * within the FileList component.
 */
export default function FileList({ rows }: { rows: Array<FileData> }) {
  const [fileRows, setFileRows] = useState<Array<FileData>>(rows);

  const handleAttributeChange = (
    fileName: string,
    attribute: keyof FileData,
    value: string | boolean | FileTypes
  ) => {
    setFileRows((prevRows) =>
      prevRows.map((row) =>
        row.fileName === fileName ? { ...row, [attribute]: value } : row
      )
    );
  };

  const handleRemoveFile = (fileName: string) => {
    setFileRows((prevRows) =>
      prevRows.filter((row) => row.fileName !== fileName)
    );
  };

  return (
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
          {fileRows.map((row) => (
            <tr key={row.fileName}>
              {/*<th scope="row">{row.fileName}</th>*/}
              <td>{row.fileName}</td>
              <td>{row.fileType}</td>
              <td>
                <FileContentSelect
                  fileName={row.fileName}
                  handleAttributeChange={handleAttributeChange}
                ></FileContentSelect>
              </td>
              <td>
                <Checkbox
                  checked={row.solution}
                  onChange={() =>
                    handleAttributeChange(
                      row.fileName,
                      "solution",
                      !row.solution
                    )
                  }
                ></Checkbox>
              </td>
              <td>
                <Checkbox
                  checked={row.showStudent}
                  onChange={() =>
                    handleAttributeChange(
                      row.fileName,
                      "showStudent",
                      !row.showStudent
                    )
                  }
                ></Checkbox>
              </td>
              <td>
                <IconButton onClick={() => handleRemoveFile(row.fileName)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
}
