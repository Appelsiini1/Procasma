import { useNavigate } from "react-router";
import { Stack } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import {
  AssignmentTypes,
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleDatabase,
  SetData,
  TagDatabase,
} from "../types";
import {
  filterState,
  generateChecklist,
  generateFilterList,
  handleUpdateFilter,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import HelpText from "../components/HelpText";
import { DEVMODE } from "../constantsUI";
import Browser from "../components/Browser";
import SpecialButton from "../components/SpecialButton";

export default function AssignmentBrowse() {
  const {
    activePath,
    activeAssignment,
    handleActiveAssignment,
    activeAssignments,
    handleActiveAssignments,
    selectAssignment,
    handleSelectAssignment,
    previousPath,
  }: {
    activePath: string;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
    handleActiveSet: (value: SetData) => void;
    selectAssignment: boolean;
    handleSelectAssignment: (value: boolean) => void;
    previousPath: string;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [allSelected, setAllSelected] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>(undefined);
  const [uniqueModules, setUniqueModules] =
    useState<Array<filterState>>(undefined);
  const [uniqueTypes, setUniqueTypes] = useState<Array<filterState>>(undefined);
  const [search, setSearch] = useState<string>("");
  const resultDependencies = [uniqueTags, uniqueModules, uniqueTypes, search];
  const [requestRefreshBrowser, setRequestRefreshBrowser] = useState(true);

  const navigate = useNavigate();
  let assignments: Array<React.JSX.Element> = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;
  let types: Array<React.JSX.Element> = null;

  async function getFilteredAssignments() {
    // Map out the string values of the checked filters
    const filters = {
      tags: uniqueTags.filter((u) => u.isChecked).map((f) => f.value),
      module: uniqueModules.filter((u) => u.isChecked).map((f) => f.value),
      type: uniqueTypes.filter((u) => u.isChecked).map((f) => f.value),
      title: search,
    };

    const assignmentsResult: CodeAssignmentDatabase[] = await handleIPCResult(
      () => window.api.getFilteredAssignmentsDB(activePath, filters)
    );

    // wrap the fetched assignments to store checked state
    const assignentsWithCheck: AssignmentWithCheck[] =
      wrapWithCheck(assignmentsResult);

    // update assignments and filters
    setCourseAssignments(assignentsWithCheck);
  }

  async function getFilters() {
    const tagsResult: TagDatabase[] = await handleIPCResult(() =>
      window.api.getAssignmentTagsDB(activePath)
    );
    handleUpdateUniqueTags(tagsResult, setUniqueTags);
    const modulesResult: ModuleDatabase[] = await handleIPCResult(() =>
      window.api.getModulesDB(activePath)
    );
    handleUpdateFilter(
      modulesResult.map((m) => m.name),
      setUniqueModules
    );
    if (previousPath === "/exportProject") {
      handleUpdateFilter(["finalWork"], setUniqueTypes, true);
    } else if (previousPath === "/setCreator") {
      handleUpdateFilter(["assignment"], setUniqueTypes, true);
    } else {
      handleUpdateFilter(Object.values(AssignmentTypes), setUniqueTypes);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
  }

  useEffect(() => {
    handleHeaderPageName("ui_assignment_browser");
  }, []);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      await handleIPCResult(() =>
        window.api.handleDeleteAssignmentsFS(
          activePath,
          selectedAssignments.map((assignment) => assignment.id)
        )
      );

      setRequestRefreshBrowser(true); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // Update the selected assignments counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(
      courseAssignments,
      setSelectedAssignments
    );

    setNumSelected(numChecked);
  }, [courseAssignments]);

  assignments = generateChecklist(
    courseAssignments,
    setCourseAssignments,
    handleOpenAssignment,
    true
  );
  modules = generateFilterList(uniqueModules, setUniqueModules);
  tags = generateFilterList(uniqueTags, setUniqueTags);
  types = generateFilterList(uniqueTypes, setUniqueTypes, true);

  async function handleOpenAssignment(id?: string) {
    try {
      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(
          activePath,
          id ?? selectedAssignments[0].id
        )
      );

      handleActiveAssignment(assignmentsResult[0]);
      setNavigateToAssignment(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  // Navigates to an assignment page by listening to the active assignment.
  useEffect(() => {
    if (activeAssignment && navigateToAssignment) {
      setNavigateToAssignment(false);

      const activeAssignmentType: string = activeAssignment.assignmentType;
      if (activeAssignmentType === "assignment") {
        navigate("/inputCodeAssignment");
      } else if (activeAssignmentType === "finalWork") {
        navigate("/inputCodeProjectWork");
      }
    }
  }, [activeAssignment, navigateToAssignment]);

  useEffect(() => {
    if (activeAssignments && navigateBack) {
      setNavigateToAssignment(false);
      navigate(-1);
    }
  }, [activeAssignments, navigateBack]);

  function confirmSelectedAndReturn() {
    // add chosen to activeAssignments and
    // go back to AssignmentInput
    //setNavigateToAssignment(true);
    setNavigateBack(true);
    handleSelectAssignment(false);
    handleActiveAssignments(selectedAssignments);
  }

  async function importAssignments() {
    let snackbarSeverity = "success";
    let snackbarText = "";
    handleSnackbar({ ["action"]: parseUICode("ui_importing_assignments") });
    try {
      // get the assignmentData folder to import from the user
      const importPath: string = await handleIPCResult(() =>
        window.api.selectDir()
      );

      if (importPath.length === 0) {
        throw new Error("ui_folder_invalid");
      }

      const importResult = await handleIPCResult(() =>
        window.api.importAssignmentsFS(activePath, importPath)
      );

      snackbarText = importResult;
      setRequestRefreshBrowser(true); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  function toggleAll() {
    const checkedElements = courseAssignments.map((assignment) => {
      assignment.isChecked = allSelected ? false : true;
      return assignment;
    });

    // invert the state
    setAllSelected((prevState) => !prevState);

    setCourseAssignments(checkedElements);
  }

  // function handleCreateSet() {
  //   if (selectedAssignments?.length > 0) {
  //     handleActiveAssignments(selectedAssignments);
  //     handleActiveSet(undefined);
  //     handleSetFromBrowse(true);
  //     navigate("/setCreator");
  //   } else {
  //     handleSnackbar({ ["error"]: parseUICode("ui_no_assignment_seleted") });
  //   }
  // }

  return (
    <>
      <SearchBar
        autoFillOptions={courseAssignments}
        optionLabel={"title"}
        searchFunction={handleSearch}
      />

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        sx={{ marginTop: "1rem" }}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => handleOpenAssignment()}
          ariaLabel={parseUICode("ui_aria_show_edit")}
          disabled={numSelected === 1 ? false : true}
        >
          {parseUICode("ui_show_edit")}
        </ButtonComp>
        {typeof activeAssignments !== "undefined" || selectAssignment ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              confirmSelectedAndReturn();
            }}
            ariaLabel={parseUICode("ui_accept_and_return")}
          >
            {`(${numSelected}) ${parseUICode("ui_accept_and_return")}`}
          </ButtonComp>
        ) : (
          <>
            {/* <ButtonComp
              buttonType="normal"
              onClick={() => {
                handleCreateSet();
              }}
              ariaLabel={parseUICode("ui_create_new_set")}
              disabled={numSelected > 0 ? false : true}
            >
              {parseUICode("ui_create_set")}
            </ButtonComp> */}
            <ButtonComp
              confirmationModal={true}
              modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
              buttonType="delete"
              onClick={() => handleDeleteSelected()}
              ariaLabel={parseUICode("ui_aria_remove_selected")}
              disabled={numSelected > 0 ? false : true}
            >
              {`${parseUICode("ui_delete")} ${numSelected}`}
            </ButtonComp>

            <ButtonComp
              buttonType="normal"
              onClick={() => toggleAll()}
              ariaLabel={
                allSelected
                  ? parseUICode("ui_deselect_all")
                  : parseUICode("ui_select_all")
              }
            >
              {allSelected
                ? parseUICode("ui_deselect_all")
                : parseUICode("ui_select_all")}
            </ButtonComp>

            <HelpText text={parseUICode("help_import_assignments")}>
              <ButtonComp
                buttonType="import"
                onClick={() => importAssignments()}
                ariaLabel={parseUICode("ui_import_assignments")}
              >
                {parseUICode("ui_import_assignments")}
              </ButtonComp>
            </HelpText>
          </>
        )}
      </Stack>

      {activePath ? (
        <Browser
          results={assignments}
          filters={[
            { name: parseUICode("ui_types"), element: types },
            { name: parseUICode("ui_tags"), element: tags },
            { name: parseUICode("ui_modules"), element: modules },
          ]}
          getResultsFunc={() => getFilteredAssignments()}
          getFiltersFunc={() => getFilters()}
          resultDependencies={resultDependencies}
          requestRefreshBrowser={requestRefreshBrowser}
          setRequestRefreshBrowser={setRequestRefreshBrowser}
        ></Browser>
      ) : (
        ""
      )}

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <SpecialButton buttonType="cancel" />
        {DEVMODE ? (
          <ButtonComp
            buttonType="debug"
            onClick={() => console.log(courseAssignments)}
            ariaLabel={" debug "}
          >
            log all assignments
          </ButtonComp>
        ) : (
          ""
        )}
      </Stack>
    </>
  );
}
