import path from "path";
import rawFs from "fs";
import { generate } from "./index";
import { readFile, write, writeFile } from "fs/promises";
const fs = rawFs.promises;

describe("generate", () => {
  test("finds templates in searchPath and creats outputDir", async () => {
    const pagesDir = await createTestDirectory("pages");
    const templatesDir = await createTestDirectory("templates");

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

    const outputDir = path.join(process.cwd(), "out");
    await generate({
      pagesDir: pagesDir,
      templatesDir: templatesDir,
      outputDir,
    });

    const indexHtmlContent = await readFile(path.join(outputDir, "index.html"));
    expect(indexHtmlContent.toString()).toEqual(
      htmlFileContent(headerTemplate)
    );
  });
});

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
