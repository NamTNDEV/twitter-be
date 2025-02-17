interface ArgEnumType {
  [key: string]: string | number;
}

export const transEnumToNumber = (argEnum: ArgEnumType) => {
  console.log(":::transEnumToNumber:::", Object.values(argEnum).filter((value) => typeof value === "number") as number[])
  return Object.values(argEnum).filter((value) => typeof value === "number") as number[];
}