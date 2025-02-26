import argv from "minimist";
import envConfig from "~/constants/config";

const options = argv(process.argv.slice(2));

export const getEnvPath = () => {
  if (options.env) {
    return `.env.${options.env}`;
  }
  return ".env";
}

export const getEnvPathWithoutLib3 = (env: string) => {
  if (env) {
    return `.env.${env}`;
  }
  return ".env";
}