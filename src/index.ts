import { mkdir, rmdir } from "fs/promises";
import { FileId, Options } from "./types";
import { pageBuilder } from "./page/page-builder";
import { listFiles } from "./files/list-files";

export const generate = async (options: Options) => {
  const { pages, templateFiles } = await listFiles(options);

  await createOutputDir(options);

  try {
    await buildAllPages(pages, options.outputDir, templateFiles);
  } catch (error) {
    await clearOutputDir(options);
    throw error;
  }
};

const createOutputDir = (options: Options) =>
  mkdir(options.outputDir, { recursive: true });

const clearOutputDir = (options: Options) =>
  rmdir(options.outputDir, { recursive: true });

const buildAllPages = (
  pages: FileId[],
  outputDir: string,
  templateFiles: FileId[]
) =>
  Promise.all(
    pages.map((file) => pageBuilder({ file, outputDir, templateFiles }))
  );
