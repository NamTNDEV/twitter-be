import minimist from "minimist";

const args = minimist(process.argv.slice(2));

export const checkEnv = (env: string) => {
  return Boolean(args[env]);
}