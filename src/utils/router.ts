import { PathParams } from "../types/global";

export const validateParams = <ERoute extends string>(
  path: ERoute,
  params: unknown
): params is PathParams => {
  if (!(params instanceof Object)) return false;

  const paramSet = new Set(Object.keys(params));

  // Validate params
  const requiredParams = path
    .split("/")
    .filter((s) => s.startsWith(":"))
    .map((s) => s.slice(1));

  for (const param of requiredParams) {
    if (!paramSet.has(param)) return false;
  }

  return true;
};
