"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abfahrt_1 = require("abfahrt");
const env_1 = __importDefault(require("./env"));
async function main() {
    console.log("miles account email:", env_1.default.milesAccountEmail);
    console.log("MilesClient instance:", new abfahrt_1.MilesClient());
}
main();
