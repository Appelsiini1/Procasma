import { Modal, ModalClose, ModalDialog, Stack, Typography } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Browser from "../components/Browser";
import ButtonComp from "../components/ButtonComp";
import { ActiveObjectContext, UIContext } from "../components/Context";
import HelpText from "../components/HelpText";
import SearchBar from "../components/SearchBar";
import SpecialButton from "../components/SpecialButton";
import {
  filterState,
  generateChecklist,
  generateFilterList,
  handleUpdateFilter,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import {
  AssignmentTypes,
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleDatabase,
  TagDatabase,
} from "../types";
import DebugButtonStack from "./DebugButtonStack";

interface AssignmentSelectProps {
  useAsModalSelect: boolean;
  parentAssignments?: CodeAssignmentDatabase[];
  handleParentAssignments?: (value: CodeAssignmentDatabase[]) => void;
  typeFilters?: string[];
}

/**
 * Select assignments using a browser.
 * @param useAsModalSelect Defines whether the editor should be in a modal.
 * @param parentAssignments The assignments that have been selected. Setting
 *   this to undefined will close the modal.
 * @param handleParentAssignments The handler for the parentAssignments state.
 */
export default function AssignmentSelect({
  useAsModalSelect,
  parentAssignments,
  handleParentAssignments,
  typeFilters,
}: AssignmentSelectProps) {
  const {
    activePath,
    activeAssignment,
    handleActiveAssignment,
  }: {
    activePath: string;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
  } = useContext(ActiveObjectContext);
  const { handleSnackbar } = useContext(UIContext);
  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [allSelected, setAllSelected] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);

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

    if (typeof typeFilters !== "undefined") {
      handleUpdateFilter(typeFilters, setUniqueTypes, true);
    } else {
      handleUpdateFilter(Object.values(AssignmentTypes), setUniqueTypes);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
  }

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
  //     handleParentAssignments(selectedAssignments);
  //     handleActiveSet(undefined);
  //     handleSetFromBrowse(true);
  //     navigate("/setCreator");
  //   } else {
  //     handleSnackbar({ ["error"]: parseUICode("ui_no_assignment_seleted") });
  //   }
  // }

  const content = () => {
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
        >
          {useAsModalSelect ? (
            <ButtonComp
              buttonType="normal"
              onClick={() =>
                handleParentAssignments(
                  selectedAssignments.length > 0
                    ? selectedAssignments
                    : undefined
                )
              }
              ariaLabel={parseUICode("ui_accept_and_return")}
            >
              {`(${numSelected}) ${parseUICode("ui_accept_and_return")}`}
            </ButtonComp>
          ) : (
            <>
              <ButtonComp
                buttonType="normal"
                onClick={() => handleOpenAssignment()}
                ariaLabel={parseUICode("ui_aria_show_edit")}
                disabled={numSelected === 1 ? false : true}
              >
                {parseUICode("ui_show_edit")}
              </ButtonComp>
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
          {useAsModalSelect ? (
            <ButtonComp
              buttonType="normal"
              onClick={() => handleParentAssignments(undefined)}
              ariaLabel={parseUICode("ui_aria_cancel")}
            >
              {parseUICode("ui_close")}
            </ButtonComp>
          ) : (
            <SpecialButton buttonType="cancel" />
          )}
          <DebugButtonStack items={{ courseAssignments }} />
        </Stack>
      </>
    );
  };

  return (
    <>
      {useAsModalSelect ? (
        <Modal
          open={typeof parentAssignments !== "undefined"}
          onClose={() => handleParentAssignments(undefined)}
        >
          <ModalDialog variant="plain" size="sm">
            <ModalClose />
            <Stack
              gap={2}
              sx={{
                width: "90vw",
              }}
            >
              <Typography level="h1">
                {parseUICode("ui_select_assignments")}
              </Typography>
              {content()}
            </Stack>
          </ModalDialog>
        </Modal>
      ) : (
        <Stack gap={2}>{content()}</Stack>
      )}
    </>
  );
}
