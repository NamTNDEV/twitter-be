interface ArgEnumType {
  [key: string]: string | number;
}

export const transEnumToNumber = (argEnum: ArgEnumType) => {
  return Object.values(argEnum).filter((value) => typeof value === "number") as number[];
}