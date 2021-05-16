import path from "path";
import { readFile } from "fs/promises";
import { createDirectories, createFile, htmlFileContent } from "./test/helper";
import { Options } from "./types";
import * as fs from "fs";

describe("generate", () => {
  beforeAll(async () => {
    await exec("npm run prepublish");
    await exec("npm link");
  });

  test("finds templates in searchPath and creats outputDir", async () => {
    const { pagesDir, templatesDir, outputDir } = await createDirectories();

    const indexHtmlPath = path.join(outputDir, "index.html");
    const headerTemplate = `<h1>Hello World!</h1>`;
    await Promise.all([
      createFile({
        dir: pagesDir,
        name: "index.mustache",
        content: htmlFileContent("{{{ templates.header }}}"),
      }),
      createFile({
        dir: templatesDir,
        name: "header.html",
        content: headerTemplate,
      }),
    ]);

    await runViaCli({ pagesDir, templatesDir, outputDir });

    const indexHtmlContent = await readFile(indexHtmlPath);
    expect(indexHtmlContent.toString()).toEqual(
      htmlFileContent(headerTemplate)
    );
  });

  test("fails if pages template id is not in templates directory", async () => {
    const { pagesDir, templatesDir, outputDir } = await createDirectories();

    const headerTemplate = `<h1>Hello World!</h1>`;
    await Promise.all([
      createFile({
        dir: pagesDir,
        name: "index.mustache",
        content: htmlFileContent(`
          {{{ templates.header }}} 
          some other content 
          {{{ templates.footer }}}
          `),
      }),
      createFile({
        dir: templatesDir,
        name: "header.html",
        content: headerTemplate,
      }),
    ]);

    const generatePromise = runViaCli({ pagesDir, templatesDir, outputDir });

    await expect(generatePromise).rejects.toThrow(
      `🛑 Could not find the template 'templates.footer' in the page 'index.mustache'.
   Make sure you created a 'footer.html' in the templates directory.`
    );
  });

  test("clears out directory if process fails", async () => {
    const { pagesDir, templatesDir, outputDir } = await createDirectories();

    await Promise.all([
      createFile({
        dir: pagesDir,
        name: "index.mustache",
        content: htmlFileContent(`{{{ templates.header }}}`),
      }),
    ]);

    try {
      await runViaCli({ pagesDir, templatesDir, outputDir });
    } catch (e) {}

    expect(fs.existsSync(outputDir)).toBeFalsy();
  });
});

import { promisify } from "util";
import { exec as execLegacy } from "child_process";
const exec = promisify(execLegacy);

const runViaCli = async (options: Options) => {
  await exec(
    `htmlgen --templatesDir ${options.templatesDir} --outputDir ${options.outputDir} --pagesDir ${options.pagesDir}`
  );
};
