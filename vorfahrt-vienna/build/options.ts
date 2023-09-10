import { join } from "path"

export const ORIGINAL_MARKER_SIZE = 120;
export const MARKER_SIZE = 120 * 2;

export const rawAssetsDir = join(__dirname, "../assets/");

export const pngOutDir = join(__dirname, "../dist/png/");
export const svgOutDir = join(__dirname, "../dist/svg/");

export const markersPngOutDir = join(pngOutDir, "markers/");
export const markersSvgOutDir = join(svgOutDir, "markers/");

export const generatedOutputDir = join(__dirname, "../src/generated/");

export const spriteSheetDir = join(__dirname, "../spritesheets/")

export const SPRITESHEET_REGEX = /^(.*)\.spritesheet\.svg$/

export const markerDir = join(rawAssetsDir, "VehicleMarker/");
// export const markerDir = join(spriteSheetDir, "VehicleMarker/");