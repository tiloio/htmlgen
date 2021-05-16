import { mkdir, rmdir, writeFile } from "fs/promises";
import path from "path";

export const createDirectories = async () => {
  const outputDir = path.join(process.cwd(), "out");

  const [pagesDir, templatesDir] = await Promise.all([
    createTestDirectory("pages"),
    createTestDirectory("templates"),
    rmdir(outputDir, { recursive: true }),
  ]);

  return { pagesDir, templatesDir, outputDir };
};

export const createTestDirectory = async (name: string) => {
  const testDirectory = path.join(
    process.cwd(),
    "running-test-resources",
    name
  );
  await rmdir(testDirectory, { recursive: true });
  await mkdir(testDirectory, { recursive: true });

  return testDirectory;
};

export const createFile = async (options: {
  dir: string;
  name: string;
  content: string;
}) => {
  const filePath = path.resolve(options.dir, options.name);
  await writeFile(filePath, options.content);

  return { path: filePath };
};

export const htmlFileContent = (body: string) => `
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
