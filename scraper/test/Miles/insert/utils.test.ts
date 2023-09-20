import assert = require("assert");
import insecureHash from "../../../src/Miles/utils/InsecureHash";

describe("test insecureHash function", function () {

    it("hash should be reproducible", function (done) {
        const hash1 = insecureHash("123", "456");
        const hash2 = insecureHash("123", "456");
        assert.equal(hash1, hash2);
        done();
    })

    it("hash should be different for different inputs", function (done) {
        const hash1 = insecureHash("123", "456");
        const hash2 = insecureHash("456", "123");
        assert.notEqual(hash1, hash2);
        done();
    })

    it("hash should take all arguments into account", function (done) {
        const hash1 = insecureHash("123", "456");
        const hash2 = insecureHash("123");
        const hash3 = insecureHash("123", "789");
        const hash4 = insecureHash("123", "456", "789");
        const hash5 = insecureHash("456", "789");
        assert.notEqual(hash1, hash2);
        assert.notEqual(hash1, hash3);
        assert.notEqual(hash1, hash4);
        assert.notEqual(hash3, hash4);
        assert.notEqual(hash4, hash5);
        done();
    })
})