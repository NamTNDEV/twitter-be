import argv from "minimist";

const options = argv(process.argv.slice(2));

export const getEnvPath = () => {
  if (options.env) {
    return `.env.${options.env}`;
  }
  return ".env";
}