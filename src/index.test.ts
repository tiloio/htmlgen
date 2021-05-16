import path from "path";
import rawFs from "fs";
import { generate } from "./index";
import { readFile, write, writeFile } from "fs/promises";
const fs = rawFs.promises;

describe("generate", () => {
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

    await generate({ pagesDir, templatesDir, outputDir });

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

    const generatePromise = generate({ pagesDir, templatesDir, outputDir });

    await expect(generatePromise).rejects.toThrowError(
      new Error(
        `🛑 Could not find the template 'templates.footer' in the page 'index.mustache'.
Make sure you created a 'footer.html' in the templates directory.`
      )
    );
  });
});

const createDirectories = async () => {
  const [pagesDir, templatesDir] = await Promise.all([
    createTestDirectory("pages"),
    createTestDirectory("templates"),
  ]);

  const outputDir = path.join(process.cwd(), "out");
  return { pagesDir, templatesDir, outputDir };
};

async function createTestDirectory(name: string) {
  const testDirectory = path.join(
    process.cwd(),
    "running-test-resources",
    name
  );
  await fs.mkdir(testDirectory, { recursive: true });

  return testDirectory;
}

async function createFile(options: {
  dir: string;
  name: string;
  content: string;
}) {
  const filePath = path.resolve(options.dir, options.name);
  await writeFile(filePath, options.content);

  return { path: filePath };
}

const htmlFileContent = (body: string) => `
      <!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test</title>
</head>
<body>
  ${body}
</body>
</html>
      `;
