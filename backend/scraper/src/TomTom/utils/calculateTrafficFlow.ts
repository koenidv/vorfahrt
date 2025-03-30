import sharp from "sharp"
import { TrafficApiResult } from "TomTom/TrafficFlow.types"

/**
 * Calculates the average redness of non-transparent pixels in a traffic flow tile
 */
export async function calculateTrafficFlow(
  apiResponse: TrafficApiResult
): Promise<number> {
  const { data, info } = await sharp(apiResponse.tile)
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (info.channels !== 4) {
    throw new Error("Invalid image format: expected 4 channels (RGBA)")
  }

  let flowAcc = 0
  let nonTransparentPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i] / 255
    const green = data[i + 1] / 255
    const blue = data[i + 2] / 255
    const alpha = data[i + 3] / 255

    if (red == green && green == blue) continue // road closure

    if (alpha > 0) {
      flowAcc += calculateSlowdownForPixel(red, green, blue)
      nonTransparentPixels++
    }
  }

  if (nonTransparentPixels === 0) return 1

  return Math.round((1 - flowAcc / nonTransparentPixels) * 1000) / 1000
}

export function calculateSlowdownForPixel(
  red: number,
  green: number,
  blue: number
): number {
  let flow
  if (green >= red) {
    flow = red * 0.65 // green→yellow: red increases while green stays high
  } else {
    flow = 0.65 + 0.35 * (1 - green) // yellow→red: green decreases while red stays high
  }
  return Math.min(1, Math.max(0, (flow - 0.1) / 0.8))
}
