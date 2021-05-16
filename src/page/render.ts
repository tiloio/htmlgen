import { readFile } from "fs/promises";
import Mustache from "mustache";
import { MissingTemplateError } from "./missing-template.error";
import { PageBuilder } from "./types";
import { FileId } from "../types";
import path from "path";

const TAG_ARRAY = Object.freeze({
  type: 0,
  id: 1,
});

export const renderContent = async (pageBuilder: PageBuilder) => {
  const pageContent = await readFileContent(pageBuilder.file.path);
  const templates = await loadNeededTemplates(pageContent, pageBuilder);

  const content = Mustache.render(pageContent, { templates });

  Mustache.clearCache();

  return content;
};

const readFileContent = (path: string) =>
  readFile(path).then((buffer) => buffer.toString());

const loadNeededTemplates = (pageContent: string, pageBuilder: PageBuilder) =>
  loadTemplates(extractTemplates(pageContent, pageBuilder));

const extractTemplates = (pageContent: string, pageBuilder: PageBuilder) =>
  filterNeededTemplates(parseTemplateIds(pageContent), pageBuilder);

const parseTemplateIds = (content: string) =>
  parseTemplateTags(content).map((templateId) => templateId.split(".")[1]);

const parseTemplateTags = (content: string) =>
  parseNoneTextTagIds(content).filter((tagId) =>
    tagId.toLowerCase().startsWith("templates")
  );

const parseNoneTextTagIds = (content: string) =>
  parseNonTextTags(content).map((tagArray) => tagArray[TAG_ARRAY.id] as string);

const parseNonTextTags = (content: string) =>
  Mustache.parse(content).filter(
    (tagArray) => tagArray[TAG_ARRAY.type] !== "text"
  );

const loadTemplates = async (templateFiles: FileId[]) =>
  templatesToTemplateKeys(
    await Promise.all(
      templateFiles.map(
        async (template): Promise<Template> => ({
          name: template.id,
          content: await readFileContent(template.path),
        })
      )
    )
  );

const templatesToTemplateKeys = (templates: Template[]) => {
  const keys: any = {};

  templates.forEach((template) => (keys[template.name] = template.content));

  return keys;
};

const filterNeededTemplates = (
  templateIds: string[],
  pageBuilder: PageBuilder
) =>
  templateIds.map((templateId) => {
    const template = pageBuilder.templateFiles.find(
      (templateFile) => templateFile.id === templateId
    );

    if (template === undefined) {
      throw new MissingTemplateError(
        templateId,
        path.parse(pageBuilder.file.path).base
      );
    }

    return template;
  });

type Template = {
  content: string;
  name: string;
};
