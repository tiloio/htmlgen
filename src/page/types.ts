import { FileId } from "../types";

export type PageBuilder = {
  outputDir: string;
  file: FileId;
  templateFiles: FileId[];
};
