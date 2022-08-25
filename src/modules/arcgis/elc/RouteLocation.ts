export interface Geometry {
  [key: string]: unknown;
}

export interface Point {
  x: number;
  y: number;
}

export type CoordinateArray =
  | [x: number, y: number]
  | [x: number, y: number, z: number | null]
  | [x: number, y: number, z: number | null, m: number | null];

export interface Polyline {
  paths: CoordinateArray[][];
}

/**
 * An object containing values used to initialize the RouteLocation's properties.
 */
export interface RouteLocationPointInputCommon {
  Id?: number | null;
  Route: string | null;
  Decrease?: boolean | null;
  //   Arm?: number | null;
  ReferenceDate?: Date | string | null;
  ResponseDate?: Date | string | null;
}

/**
 * An object containing values used to initialize the RouteLocation's properties.
 */
export interface RouteLocationSrmpPointInput
  extends RouteLocationPointInputCommon {
  Srmp: number;
  Back?: boolean | null;
}

export interface RouteLocationArmPointInput
  extends RouteLocationPointInputCommon {
  Arm: number;
}

export interface RouteLocationLineInputCommon
  extends RouteLocationPointInputCommon {
  EndReferenceDate?: Date | string | null;
  EndResponseDate?: Date | string | null;
}

export interface RouteLocationSrmpLineInput
  extends RouteLocationLineInputCommon,
    RouteLocationSrmpPointInput {
  EndSrmp: number;
  EndBack?: boolean | null;
}

export interface RouteLocationArmLineInput
  extends RouteLocationArmPointInput,
    RouteLocationLineInputCommon {
  EndArm: number;
}

export interface OutputPointRouteLocation
  extends RouteLocationPointInputCommon {
  RealignmentDate?: Date | string | null;
  ArmCalcReturnCode?: number | null;
  ArmCalcReturnMessage?: string | null;
  LocatingError?: string | null;
  RouteGeometry?: Point;
  EventPoint?: Point | null;
  Distance?: number | null;
  Angle?: number | null;
}

export interface OutputLineRouteLocation extends RouteLocationLineInputCommon {
  ArmCalcEndReturnCode?: number | null;
  ArmCalcEndReturnMessage?: string | null;
}

export function IsArmPointInput(
  input: RouteLocationLineInputCommon
): input is RouteLocationArmPointInput {
  return (input as RouteLocationArmPointInput).Arm !== undefined;
}

export function IsSrmpPointInput(
  input: RouteLocationLineInputCommon
): input is RouteLocationSrmpPointInput {
  return (input as RouteLocationSrmpPointInput).Srmp !== undefined;
}

export function IsArmLineInput(
  input: RouteLocationLineInputCommon
): input is RouteLocationArmLineInput {
  return (
    IsArmPointInput(input) &&
    (input as RouteLocationArmLineInput).EndArm !== undefined
  );
}

export function IsSrmpLineInput(
  input: RouteLocationLineInputCommon
): input is RouteLocationSrmpLineInput {
  return (
    IsSrmpPointInput(input) &&
    (input as RouteLocationSrmpLineInput).EndSrmp !== undefined
  );
}

export function IsValidRouteLocation(
  input: RouteLocationPointInputCommon
): input is RouteLocationArmPointInput | RouteLocationSrmpLineInput {
  return IsArmPointInput(input) || IsSrmpLineInput(input);
}

export function IsValidRouteLineLocation(
  input: RouteLocationPointInputCommon
): input is RouteLocationArmLineInput | RouteLocationSrmpLineInput {
  return IsArmLineInput(input) || IsSrmpLineInput(input);
}
