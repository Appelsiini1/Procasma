import { Checkbox, IconButton, Sheet, Table } from "@mui/joy";
import {
  ui_select,
  ui_type,
  ui_show_to_student,
  ui_resultfile,
  ui_name,
  ex_solution,
  ui_actions,
} from "../../resource/texts.json";
import { FileData } from "src/types";
import DeleteIcon from "@mui/icons-material/Delete";
import { language } from "../constantsUI";

export default function FileList({ rows }: { rows: Array<FileData> }) {
  return (
    <Sheet>
      <Table borderAxis="xBetween" hoverRow>
        <thead>
          <tr>
            <th>{ui_select[language.current]}</th>
            <th>{ui_name[language.current]}</th>
            <th>{ui_type[language.current]}</th>
            <th>{ex_solution[language.current]}</th>
            <th>{ui_resultfile[language.current]}</th>
            <th>{ui_show_to_student[language.current]}</th>
            <th>{ui_actions[language.current]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.fileName}>
              <td>
                <Checkbox></Checkbox>
              </td>
              <th scope="row">{row.fileName}</th>
              <td>{row.fileType}</td>
              <td>
                <Checkbox checked={row.solution}></Checkbox>
              </td>
              <td>
                {/*Replace checkbox with a dropdown? to select between resultfile, codefile, datafile... */}
                <Checkbox checked={row.resultFile}></Checkbox>
              </td>
              <td>
                <Checkbox checked={row.show_student}></Checkbox>
              </td>
              <td>
                <IconButton>
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
