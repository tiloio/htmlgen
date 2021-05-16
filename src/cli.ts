import { generate } from "./index";
import { Options } from "./types";

export const cli = (args: string[]) => generate(extractOptions(args));

const extractOptions = (standardArgs: string[]): Options => {
  const args = filterNonStandardArgs(standardArgs);

  const options: Options = {
    pagesDir: "",
    templatesDir: "",
    outputDir: "",
  };

  for (let i = 0; i < args.length; i = i + 2) {
    const argValueIndex = i + 1;
    const argName = sliceDashes(args[i]);

    (options as any)[argName] = args[argValueIndex];
  }

  return options;
};

const sliceDashes = (arg: string) => arg.slice(2);
const filterNonStandardArgs = (args: string[]) => args.slice(2);
