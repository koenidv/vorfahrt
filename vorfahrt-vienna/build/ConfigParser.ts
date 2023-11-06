import { join } from "path";
import { spriteSheetDir } from "./options";
import fs from "fs";
import { OptionsObject, GroupObject, ParsedGroup, ParsedGroups, BuildObject, ParsedConfig } from "./config.types";


export default class ConfigParser {
    configDir: string; // should be joined with spritesheetDir (import from ./options) already
    spritesheetDir: string;
    groups: ParsedGroups;

    constructor(configDir: string) {
        this.configDir = configDir;
    }

    parseConfig(): ParsedConfig {
        console.info(`Reading config from ${this.configDir}`);
        const configPath = this.configDir;
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

        if (!config.config) throw new Error(`Config file ${configPath} does not contain a "config" object`);
        const { spritesheet, groups } = this.parseConfigOptions(config.config);
        this.spritesheetDir = spritesheet;
        this.groups = groups;
        if (!config.build) throw new Error(`Config file ${configPath} does not contain a "build" object`);
        const build = this.parseBuild(config.build)

        return { spritesheet, build };
    }

    /**
     * Parse the "config" object in the config file
     * @param configObject 
     */
    private parseConfigOptions(configObject: OptionsObject): { spritesheet: string, groups: ParsedGroups } {
        const spritesheet = configObject.spritesheet;
        if (!spritesheet) throw new Error(`Providing a spritesheet in the config file is required`);
        let groups: ParsedGroups = {};
        if (configObject.groups) {
            groups = Object.entries(configObject.groups).reduce((acc, [groupName, groupObject]) => {
                acc[groupName] = this.parseOptionsGroup(groupObject);
                return acc;
            }, {} as { [key: string]: string[][] });
        }

        return { spritesheet, groups };
    }

    private parseOptionsGroup(group: GroupObject): ParsedGroup {
        const { values, combineValues, includeNone } = group;
        if (includeNone) values.push("none");
        if (combineValues) return this.combineGroupValues(values);
        else return values.map(v => [v]);
    }

    private combineGroupValues(values: string[]): string[][] {
        const result: string[][] = [];
        for (let i = 0; i < values.length; i++) {
            for (let j = i + 1; j < values.length; j++) {
                result.push([values[i], values[j]]);
            }
        }
        return result;
    }

    private parseBuild(buildObject: BuildObject): BuildObject {
        // expand keys starting with $ into the keys of the group
        const result: BuildObject = {};
        for (const [key, value] of Object.entries(buildObject)) {
            if (typeof value !== "object") {
                result[key] = value;
            } else if (key.startsWith("$")) {
                const groupName = key.slice(1);
                const group = this.groups[groupName];
                if (!group) throw new Error(`Group ${groupName} not found in config file`);
                for (const groupKeys of group) {
                    if (!groupKeys[0]) throw new Error(`Group ${groupName} contains an empty array`);
                    result[groupKeys.shift()!] = groupKeys.reduceRight((acc, key) => ({ [key]: acc }), this.parseBuild(value));
                }
            } else {
                result[key] = this.parseBuild(value);
            }
        }
        return result;
    }


}