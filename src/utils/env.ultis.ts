import argv from "minimist";
import envConfig from "~/constants/config";

const options = argv(process.argv.slice(2));

export const getEnvPath = () => {
  if (options.env) {
    console.log("You are running code with env::: ", options.env);
    return `.env.${options.env}`;
  }
  console.log("You are running code with env::: development");
  return ".env";
}

export const getEnvPathWithoutLib3 = (env: string) => {
  if (env) {
    console.log("You are running code with env::: ", env);
    return `.env.${env}`;
  }
  console.log("You are running code with env::: development");
  return ".env";
}