import * as turf from "@turf/turf"
import rbush from "rbush"

export interface PostalCodeFeature {
  type: "Feature"
  properties: {
    plz: string
  }
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][]
  }
}

export class PostalCodeLookup {
  private spatialIndex: any
  private postalCodePolygons: Map<number, PostalCodeFeature>

  constructor(geoJSONData: { features: PostalCodeFeature[] }) {
    this.spatialIndex = new rbush()
    this.postalCodePolygons = new Map()

    // spatial index
    const items = geoJSONData.features.map((feature, id) => {
      const bbox = turf.bbox(feature)
      this.postalCodePolygons.set(id, feature)

      return {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        id,
      }
    })

    this.spatialIndex.load(items)
  }

  async getPostalCode(
    longitude: number,
    latitude: number
  ): Promise<string | null> {
    const point = [longitude, latitude]
    const potentialMatches = this.spatialIndex.search({
      minX: longitude,
      minY: latitude,
      maxX: longitude,
      maxY: latitude,
    })

    for (const match of potentialMatches) {
      const feature = this.postalCodePolygons.get(match.id)
      if (!feature) continue

      const polygon =
        feature.geometry.type === "Polygon"
          ? turf.polygon(feature.geometry.coordinates)
          : turf.multiPolygon(feature.geometry.coordinates)

      if (turf.booleanPointInPolygon(turf.point(point), polygon)) {
        return feature.properties.plz
      }
    }

    console.log("No postal code found for", point)

    return null
  }

  listPostalCodes(): Set<string> {
    const postalCodes = new Set<string>()
    for (const feature of this.postalCodePolygons.values()) {
      postalCodes.add(feature.properties.plz)
    }
    return postalCodes
  }
}
