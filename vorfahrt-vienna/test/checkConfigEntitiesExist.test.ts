import { getAllKeys } from "../build/checkConfigEntitesExist";

describe("keys from object", () => {
    it("should get all keys", () => {
        const obj = {
            "sachen": {
                "testen": true,
                "andere": false
            },
            "andere": {
                "dings": true,
                "dongs": true
            }
        };

        const allKeys = getAllKeys(obj);
        expect(allKeys).toEqual(["sachen", "testen", "andere", "dings", "dongs"]);
    })
});