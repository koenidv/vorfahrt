export default class Point {
    lat: number;
    lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    public static fromString(string: string) {
        // use regex to parse string
        const matches = string.match(/^\(([\d\.,]+),([\d\.,]+)\)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid Point string");
        }
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        return new this(lat, lng);
    }

    public toString() {
        return `(${this.lat.toFixed(5)},${this.lng.toFixed(5)})`;
    }

}