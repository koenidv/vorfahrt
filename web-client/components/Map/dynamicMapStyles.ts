const dynamicMapStyles = {
  ABFAHRT: {
    CITY_DISTRICT: {
      default: {
        // strokeColor: "#65B687",
        // strokeOpacity: 0.8,
        // strokeWeight: 2,
        strokeOpacity: 0,

        fillColor: "#181818",
        fillOpacity: 0.7,
      },
      hover: {
        strokeColor: "#65B687",
        strokeOpacity: 0.8,
        strokeWeight: 2,

        fillColor: "#65B687",
        fillOpacity: 0.35,
      },
    },
  },
  MILES: {
    SERVICE_AREA: {
      default: {
        strokeColor: "#fff",
        strokeOpacity: 1,
        strokeWeight: 2,

        fillOpacity: 0,
      },
      hover: {
        strokeColor: "#fff",
        strokeOpacity: 0.8,
        strokeWeight: 2,

        fillColor: "#fff",
        fillOpacity: 0.35,
      },
    },
  },
} as const;
export default dynamicMapStyles;
