import { deepMerge, switchFirstAndSecondDepth } from "../build/parseConfig";

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

describe("switch leaf depths feature", () => {
    it("should switch first and second leaf depths", () => {
        const obj = {
            "sachen": {
                "testen": true,
                "andere": false,
                "dings": true
            },
            "andere": {
                "dings": true,
                "dongs": true,
                "testen": {
                    "dings": true
                }
            }
        };

        const switched = switchFirstAndSecondDepth(obj);

        console.log(switched);

        expect(switched).toEqual({
            "testen": {
                "sachen": true,
                "andere": {
                    "dings": true
                }
            },
            "andere": {
                "sachen": false
            },
            "dings": {
                "andere": true,
                "sachen": true
            },
            "dongs": {
                "andere": true
            }
        })
    })
})