import { Checkbox, Sheet, Table } from "@mui/joy";
import { ui_select, ui_type, ui_show_to_student, ui_resultfile, ui_name, ex_solution, ui_actions } from "../../resource/texts.json";
import { AssignmentData } from "src/types";

export default function ItemList({language, rows}:{language:keyof typeof ui_select, rows:Array<AssignmentData>}) {
    return <Sheet>
        <Table borderAxis='xBetween' hoverRow>
        <thead>
            <tr>
                <th>{ui_select[language]}</th>
                <th>{ui_name[language]}</th>
                <th>{ui_type[language]}</th>
                <th>{ex_solution[language]}</th>
                <th>{ui_resultfile[language]}</th>
                <th>{ui_show_to_student[language]}</th>
                <th>{ui_actions[language]}</th>
            </tr>
        </thead>
        <tbody>
            {rows.map((row) => (
                <tr key={row.assignment_id}>
                    <td><Checkbox></Checkbox></td>
                    <th scope="row">{row.assignment.title}</th>
                    <td>{}</td>
                </tr>
            ))}
        </tbody>
        </Table>
    </Sheet>
}