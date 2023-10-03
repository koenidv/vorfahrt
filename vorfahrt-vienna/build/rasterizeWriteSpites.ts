import { MergedSpriteFlattened } from "./mergeSpritesFromConfig";
import fs from "fs";
import { MARKER_SIZE, OUTPUT_PNGS, OUTPUT_SVGS, pngOutDir, svgOutDir } from "./options";
import sharp from "sharp";
import { join } from "path";
import cliProgress from "cli-progress";

export type WrittenSprite = {
    entities: string[],
    path: string,
    filetype: "png" | "svg",
}

export async function rasterizeWriteSprites(sprites: MergedSpriteFlattened[]): Promise<WrittenSprite[]> {
    await makeOutputDirectories();
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(sprites.length, 0);

    const writtenSprites: WrittenSprite[] = [];
    for (const [index, sprite] of sprites.entries()) {
        const filename = sprite.entities.join("_");

        if (OUTPUT_SVGS) {
            const svgPath = join(svgOutDir, filename + ".svg");
            await fs.promises.writeFile(svgPath, sprite.contents, "utf8");
            writtenSprites.push({
                entities: sprite.entities,
                path: svgPath,
                filetype: "svg",
            })
        }

        if (OUTPUT_PNGS) {
            try {
                const pngPath = join(pngOutDir, filename + ".png");
                await writePng(sprite, pngPath);
                writtenSprites.push({
                    entities: sprite.entities,
                    path: pngPath,
                    filetype: "png",
                })
            } catch (err) {
                console.error(`ERROR: failed to rasterize marker: "${filename}"`)
            }
        }

        progressBar.update(index + 1);
    }

    progressBar.stop();
    return writtenSprites;
}

async function makeOutputDirectories(): Promise<void> {
    if (OUTPUT_SVGS) {
        console.info("Writing SVGs to", svgOutDir);
        await fs.promises.mkdir(svgOutDir, { recursive: true });
    }
    if (OUTPUT_PNGS) {
        console.info("Writing PNGs to", pngOutDir);
        await fs.promises.mkdir(pngOutDir, { recursive: true });
    }
}

async function writePng(sprite: MergedSpriteFlattened, path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        sharp(Buffer.from(sprite.contents, 'utf8'))
            .resize(MARKER_SIZE)
            .toFormat("png")
            .toFile(path, (err) => {
                if (err) {
                    console.error(`ERROR: sharp failed to rasterize marker: "${path}"`);
                    reject(err);
                }
                resolve();
            })
    })

}