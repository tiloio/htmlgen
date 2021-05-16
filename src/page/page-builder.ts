import { writeFile } from "fs/promises";
import path from "path";
import { renderContent } from "./render";
import { PageBuilder } from "./types";

export const pageBuilder = async (pageBuilder: PageBuilder) => {
  const content = await renderContent(pageBuilder);
  await writeFile(pageOutputPath(pageBuilder), content);
};

const pageOutputPath = (pageBuilder: PageBuilder) =>
  path.join(pageBuilder.outputDir, `${pageBuilder.file.id}.html`);
