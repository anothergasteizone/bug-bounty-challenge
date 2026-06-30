import React, { JSX } from "react";

export enum ERoute {
  ROOT = "/",
  HOME = "/home",
  README = "/readme",
  LOGIN = "/login",
  SETTINGS = "/user/settings"
}

export type TRoute = {
  path: ERoute;
  Icon?: React.FC | JSX.Element;
  Component: React.FC; // React components have to be written in Capitalized!
  requiresAuth?: boolean;
};

export enum ActionResultStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export type ActionSuccess<T> = {
  status: ActionResultStatus.SUCCESS;
  result: T;
};
export type ActionError = {
  status: ActionResultStatus.ERROR;
  error: Error;
  knownErrors?: { [key: string]: string };
};
