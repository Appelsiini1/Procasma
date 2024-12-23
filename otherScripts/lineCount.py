import os

allPaths = []

srcFolder = os.listdir("src")
for item in srcFolder:
    fullPath =os.path.join("src", item)
    if os.path.isdir(fullPath):
        folderContents = os.listdir(fullPath)
        for item in folderContents:
            allPaths.append(os.path.join(fullPath, item))
    else:
        allPaths.append(fullPath)

total = 0
for item in allPaths:
    with open(item, "r", encoding="utf-8") as f:
        lineCount = len(f.readlines())
        print(f"File: {item:50s} lines: {lineCount:5d}")
        total += lineCount

print(f"Total lines: {total}")
