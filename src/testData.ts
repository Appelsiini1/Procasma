import { FileData } from "src/types";

export const dummyFileRows: FileData[] = [
  {
    fileName: "document.txt",
    path: "/documents/",
    solution: false,
    fileContent: "instruction",
    showStudent: true,
    fileType: "text",
  },
  {
    fileName: "picture.png",
    path: "/images/",
    solution: true,
    fileContent: "instruction",
    showStudent: false,
    fileType: "image",
  },
  {
    fileName: "script.js",
    path: "/code/",
    solution: false,
    fileContent: "instruction",
    showStudent: true,
    fileType: "code",
  },
];
