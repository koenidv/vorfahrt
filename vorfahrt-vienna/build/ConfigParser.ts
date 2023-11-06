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
        const { values, combine } = group;
        if (!values) throw new Error(`Values for group ${JSON.stringify(group)} may not be empty`);
        if (combine) return this.combineGroupValues(values);
        else return values.map(v => [v]);
    }

    private combineGroupValues(values: string[]): string[][] {
        // fixme this should work for any number of values, not just up to 3
        const result: string[][] = [];
        for (let i = 0; i < values.length; i++) {
            const val = values[i];
            result.push([val, "none"]);
            for (let j = i + 1; j < values.length; j++) {
                const val2 = values[j];
                result.push([val, val2, "none"]);
                for (let k = j + 1; k < values.length; k++) {
                    const val3 = values[k];
                    result.push([val, val2, val3, "none"]);
                }
            }
        }
        return result;
    }

    private parseBuild(buildObject: BuildObject): BuildObject {
        // expand keys starting with $ into the keys of the group
        if (typeof buildObject !== "object") return buildObject;
        const result: BuildObject = {};
        for (const [key, value] of Object.entries(buildObject)) {
            if (key.startsWith("$")) {
                const groupName = key.slice(1);
                const group = this.groups[groupName];
                if (!group) throw new Error(`Group ${groupName} not found in config file`);
                for (const groupKeys of group) {
                    this.addKeysRecursive(result, [...groupKeys], this.parseBuild(value));
                }
            } else {
                result[key] = this.parseBuild(value);
            }
        }
        return result;
    }

    private addKeysRecursive(obj: any, keys: string[], value: any) {
        console.log(keys)
        const key = keys.shift()!;
        if (keys.length === 0) {
            obj[key] = value;
        } else {
            if (!obj[key]) obj[key] = {};
            this.addKeysRecursive(obj[key], keys, value);
        }
    }


}