import { Dir } from "fs";
import { opendir, writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import { render } from "mustache";

export const generate = async (options: Options) => {
  const pages = await readAllFiles(options.pagesDir);
  const templateFiles = await readAllFiles(options.templatesDir);

  const templates = await Promise.all(
    templateFiles.map(async (template): Promise<Template> => {
      const name = path.parse(template.path).name;
      const content = await readFile(template.path);

      return { name, content: content.toString() };
    })
  );

  await mkdir(options.outputDir, { recursive: true });
  await Promise.all(
    pages.map((file) =>
      buildPage({ file, outputDir: options.outputDir, templates })
    )
  );
};

const buildPage = async (page: {
  outputDir: string;
  file: File;
  templates: Template[];
}) => {
  const pageContent = await readFile(page.file.path);

  const templates = createTemplateObject(page.templates);

  const content = render(pageContent.toString(), { templates });
  await writeFile(
    path.join(page.outputDir, `${path.parse(page.file.path).name}.html`),
    content
  );
};

const createTemplateObject = (templates: Template[]) => {
  const keys: any = {};

  templates.forEach((template) => (keys[template.name] = template.content));

  return keys;
};

const readAllFiles = async (directoryPath: string): Promise<File[]> => {
  const currentPath = path.resolve(process.cwd(), directoryPath);
  const directory = await opendir(currentPath);

  return await readCurrentFiles(currentPath, directory);
};

const readCurrentFiles = async (
  searchPath: string,
  directory: Dir
): Promise<File[]> => {
  const entry = await directory.read();
  if (entry === null) return [];

  const entryPath = () => path.join(searchPath, entry!.name);

  const files = await readCurrentFiles(searchPath, directory);

  if (entry.isFile()) {
    files.push({ path: entryPath() });
    return files;
  }

  if (entry.isDirectory()) {
    const directoryFiles = await readAllFiles(entryPath());

    return files.concat(directoryFiles);
  }

  return files;
};

export type File = {
  path: string;
};

export type Template = {
  content: string;
  name: string;
};

export type Options = {
  pagesDir: string;
  templatesDir: string;
  outputDir: string;
};
