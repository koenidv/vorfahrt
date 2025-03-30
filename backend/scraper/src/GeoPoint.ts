export default class GeoPoint {
    lng: number;
    lat: number;

    constructor(lng: number, lat: number) {
        this.lng = lng;
        this.lat = lat;
    }

    public static fromString(string: string) {
        // use regex to parse string
        const matches = string.match(/^\(([\d\.,]+),([\d\.,]+)\)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid Point string");
        }
        const lng = parseFloat(matches[1]);
        const lat = parseFloat(matches[2]);
        return new this(lng, lat);
    }

    public equalsWithTolerance(compare: GeoPoint, tolerance: number = 0.005) {
        return Math.abs(this.lat - compare.lat) < tolerance && Math.abs(this.lng - compare.lng) < tolerance;
    }

    public toString() {
        return `(${this.lng.toFixed(5)},${this.lat.toFixed(5)})`;
    }

}