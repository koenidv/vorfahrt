export type Config = { config: OptionsObject, build: BuildObject };
export type OptionsObject = { spritesheet: string, groups: GroupObject[] };
export type GroupObject = { values: string[], combine: boolean, optional: boolean };
export type GroupName = string; // groupnames are indicated by an $ prefix in build objects
export type BuildObject = { [key: string | GroupName]: BuildObject } | boolean;

export type ParsedConfig = { spritesheet: string, build: BuildObject };
export type ParsedGroups = { [key: GroupName]: ParsedGroup };
export type ParsedGroup = string[][];
