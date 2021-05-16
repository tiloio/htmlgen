import { Dir, Dirent } from "fs";
import { opendir } from "fs/promises";
import path from "path";
import { Options, FileId } from "../types";

export const listFiles = async (options: Options) => {
  const [pages, templateFiles] = await Promise.all([
    readAllFiles(options.pagesDir),
    readAllFiles(options.templatesDir),
  ]);
  return { pages, templateFiles };
};

const readAllFiles = async (directoryPath: string): Promise<FileId[]> => {
  const currentPath = path.resolve(process.cwd(), directoryPath);
  const directory = await opendir(currentPath);

  return await readCurrentFiles(currentPath, directory);
};

const readCurrentFiles = async (
  searchPath: string,
  directory: Dir
): Promise<FileId[]> => {
  const entry = await directory.read();
  if (entry === null) return [];

  const files = await readCurrentFiles(searchPath, directory);

  if (entry.isFile()) return appendFile(searchPath, files, entry);

  if (entry.isDirectory())
    return await appendDirectoryFiles(searchPath, files, entry);

  return files;
};

const appendFile = (searchPath: string, files: FileId[], entry: Dirent) => {
  const fileId: FileId = {
    path: path.join(searchPath, entry.name),
    id: path.parse(entry.name).name,
  };
  files.push(fileId);
  return files;
};

const appendDirectoryFiles = async (
  searchPath: string,
  files: FileId[],
  entry: Dirent
) => {
  const directoryFiles = await readAllFiles(path.join(searchPath, entry.name));

  return files.concat(directoryFiles);
};
