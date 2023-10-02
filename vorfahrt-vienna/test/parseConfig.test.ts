import { deepMerge } from "../build/parseConfig";

describe("deep merging", () => {
    it("should merge objects", () => {
        const obj1 = {
            "sachen": {
                "testen": true,
                "andere": true
            },
            "andere": {
                "dings": true
            }
        }
        const obj2 = {
            "sachen": {
                "andere": false
            },
            "andere": {
                "dongs": true
            }
        }

        const merged = deepMerge(obj1, obj2);

        expect(merged).toEqual({
            "sachen": {
                "testen": true,
                "andere": false
            },
            "andere": {
                "dings": true,
                "dongs": true
            }
        })
    })
});