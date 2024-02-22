import { doesContain } from "../../doesContain"


import { Map as GoogleMap, GoogleApiWrapper, Marker } from 'google-maps-react';

import {
  Abfahrt,
  MilesClient,
  MilesVehicleType,
  coordinatesArraysToArea,
  polygonToArea,
} from "abfahrt";

import berlinDistricts from "../../data/BER-districts.geojson.json";

import berlinVehicleResponses from "../../data/vehicles.json";

import mapStyle from "../../data/mapStyle.json";

import { useEffect, useRef, useState } from "react";

import { Loader } from "@googlemaps/js-api-loader";
import { BERLIN } from "./berlin";
import dynamicMapStyles from "./dynamicMapStyles";

const RENDER_VEHICLE_MARKERS = false;

const Map = ({
  hoveredArea,
  onAreaHover,
}: any) => {
  const [newVehicles, setVehicles] = useState<Abfahrt.Miles.Vehicle[]>([]);

  const mapRef = useRef<google.maps.Map>(null);

  const [districtInfo, setDistrictInfo] = useState<{
    [k: string]: {
      vehicles: Abfahrt.Miles.Vehicle[];
    };
  }>({});

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const vehiclesRes = await fetch("/api/vehicles");

      const vehiclesData: { data: any[] } = await vehiclesRes.json();

      const newVehicles = vehiclesData.data.reduce<Abfahrt.Miles.Vehicle[]>(
        (acc, i) => [...acc, ...i.data[0].Data.vehicles],
        []
      );
      setVehicles(newVehicles);

      const districtToVehicles = Object.fromEntries(berlinDistricts.features.map(district => {

        const vehiclesInThisDistrict = newVehicles.filter(vehicle => doesContain(district.geometry.coordinates[0][0] as [number, number][], [vehicle.Longitude, vehicle.Latitude]));

        return [district.properties.name, {
          vehicles: vehiclesInThisDistrict
        }]
      }));
      setDistrictInfo(districtToVehicles);

      if (mapRef.current) {
        for (const vehicle of newVehicles) {
          new google.maps.Marker({
            position: {
              lat: vehicle.Latitude,
              lng: vehicle.Longitude,
            },
            map: mapRef.current,
            title: vehicle.LicensePlate,
            clickable: false,
            // icon: {
            //   url: "http://localhost:3000/marker/background.svg", // url

            //   scaledSize: new google.maps.Size(50, 50), // scaled size
            //   origin: new google.maps.Point(0, 0), // origin
            //   anchor: new google.maps.Point(0, 0), // anchor
            // },
          });
        }
      }
    })();
  }, []);


  const loadMap = async () => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    const google = await loader.load();

    const mapEl = document.querySelector('[js-data="google-map"]');

    // const map = new google.maps.Map(mapEl, {
    //   center: { lat: 52.520008, lng: 13.404954 },
    //   zoom: 10,
    //   styles: mapStyle as google.maps.MapTypeStyle[],
    // });
    // mapRef.current = map;

    const miles = new MilesClient({ deviceKey: "d15231c7925b4517" });

    // console.log((await miles.getCityAreas()));

    // const areasResponse = await miles.getCityAreas();

    // console.log(areasResponse.Data)

    // const berlin = areasResponse.Data.JSONCityAreas.areas.find(
    //   (i) => i.idCity === "BER" && i.idCityLayerType === "CITY_SERVICE_AREA"
    // )!;

    // const berlinArea = polygonToArea(berlin);

    // drawAreaOnMap(map, berlinArea, "#65B687");

    // console.log(berlinDistricts.features[0].properties)

    const berlinArea: Abfahrt.Area = {
      latitude: 52.52,
      longitude: 13.405,
      latitudeDelta: 0.34234234234,
      longitudeDelta: 0.6410410925,
    };

    const ding = miles.createVehicleSearch(berlinArea);

    // ding.addEventListener("fetchCompleted", (data) => {
    //   if (data.filters.location) {
    //     drawAreaOnMap(map, data.filters.location, "blue");
    //   }
    // });

    // ding.execute();

    // ding.addEventListener("finished", (data) => {
    //   console.log(data.length);
    // });

    if (RENDER_VEHICLE_MARKERS) {
      const hardcodedVehicles = (berlinVehicleResponses as any[]).reduce<
        Abfahrt.Miles.Vehicle[]
      >((acc, i) => [...acc, ...i.data[0].Data.vehicles], []);

      for (const vehicle of hardcodedVehicles) {

        // new google.maps.Marker({
        //   position: {
        //     lat: vehicle.Latitude,
        //     lng: vehicle.Longitude,
        //   },
        //   map,
        //   title: vehicle.LicensePlate,
        //   icon: {
        //     url: "http://localhost:3000/marker/background.svg", // url

        //     scaledSize: new google.maps.Size(50, 50), // scaled size
        //     origin: new google.maps.Point(0, 0), // origin
        //     anchor: new google.maps.Point(0, 0), // anchor
        //   },
        // });
      }
    }

    const berlinMilesServiceAreaFeatures = BERLIN.coordinates.map((i) => ({
      type: "Feature",
      properties: {
        abfahrt: {
          type: "MILES:SERVICE_AREA",
          cityId: "BER",
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: i,
      },
    }));

    const berlinMilesServiceAreas = {
      type: "FeatureCollection",
      features: berlinMilesServiceAreaFeatures,
    };

    const refinedBerlinFeatures = berlinDistricts.features.map((i) => ({
      ...i,
      properties: {
        ...i.properties,
        abfahrt: {
          type: "ABFAHRT:CITY_DISTRICT",
          cityId: "BER",
          districtId: i.properties.name,
        },
      },
    }));
    const refinedBerlinDistricts = {
      ...berlinDistricts,
      features: refinedBerlinFeatures,
    };

    const layers = {
      "MILES:SERVICE_AREA": berlinMilesServiceAreas,
      "ABFAHRT:CITY_DISTRICT": refinedBerlinDistricts,
    }
    const activeLayers: (keyof typeof layers)[] = ["MILES:SERVICE_AREA", "ABFAHRT:CITY_DISTRICT"];

    for (const layer of activeLayers) {

      const dataLayer = new google.maps.Data();

      // dataLayer.setMap(map);

      dataLayer.addGeoJson(layers[layer])

      dataLayer.setStyle((feature) => {
        const featureData = feature.getProperty("abfahrt");

        const [vendor, entityType] = featureData.type.split(":");

        return dynamicMapStyles[vendor][entityType].default;
      });

      dataLayer.addListener("mouseover", (e) => {
        const featureData = e.feature.getProperty("abfahrt");

        const [vendor, entityType] = featureData.type.split(":");

        dataLayer.overrideStyle(
          e.feature,
          dynamicMapStyles[vendor][entityType].hover
        );
        if (featureData.type === "ABFAHRT:CITY_DISTRICT") {

          setHoveredDistrict(featureData.districtId);
        }
      });
      dataLayer.addListener("mouseout", (e) => {

        const featureData = e.feature.getProperty("abfahrt");

        dataLayer.revertStyle();

        if (featureData.type === "ABFAHRT:CITY_DISTRICT") { }
      });
    }
  };

  useEffect(() => {
    loadMap();
  }, []);


  const onMapReady = async (mapProps, map) => {


    // map.setMapId("7b1a9a576c1da12f");

    // Styling the map
    map.setOptions({
      styles: mapStyle // Assuming mapStyle is your JSON style object
    });

    // Creating a Data Layer
    const dataLayer = new window.google.maps.Data();
    dataLayer.setMap(map);

    // Adding GeoJSON to the Data Layer
    dataLayer.addGeoJson(berlinDistricts); // Assuming berlinDistricts is your GeoJSON object

    await google.maps.importLibrary("marker");

    const content = document.createElement("div");

    content.classList.add("property");

    content.innerHTML = `<div style="width: 1rem; height: 1rem; background: red">moin</div>`

    const AdvancedMarkerElement = new google.maps.marker.AdvancedMarkerElement({
      map,
      content,
      position: { lat: 52.520008, lng: 13.404954 },
      title: "among us",
    });

  };

  return (
    // <>
    //   <div
    //     js-data="google-map"
    //     className="w-full h-full"
    //     style={{
    //       backgroundColor: "#212121",
    //     }}
    //   />
    //   <div className="flex flex-col w-80 h-full bg-gray-700 border-l-gray-600 border-l-2">
    //     <h2>{hoveredDistrict ?? "no district selected"}</h2>
    //     <span>{districtInfo[hoveredDistrict] ? districtInfo[hoveredDistrict]?.vehicles?.length + " vehicles" : ""}</span>
    //   </div>
    // </>
    <>
      <GoogleMap
        disableDefaultUI={true}
        backgroundColor="red"
        google={google}
        initialCenter={{ lat: 52.520008, lng: 13.404954 }}
        zoom={10}
        style={{ width: '100%', height: '100%' }}
        onReady={onMapReady}
      >
        {newVehicles.map(vehicle => (
          <Marker
            key={vehicle.LicensePlate}
            position={{ lat: vehicle.Latitude, lng: vehicle.Longitude }}
            title={vehicle.LicensePlate}
          />
        ))}
      </GoogleMap>
      <div className="flex flex-col w-80 h-full bg-gray-700 border-l-gray-600 border-l-2">
        <h2>{hoveredDistrict ?? 'no district selected'}</h2>
        <span>{districtInfo[hoveredDistrict] ? districtInfo[hoveredDistrict]?.vehicles?.length + ' vehicles' : ''}</span>
      </div>
    </>
  );
};

export default GoogleApiWrapper({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
})(Map);