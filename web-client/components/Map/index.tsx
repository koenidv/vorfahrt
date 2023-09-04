import { doesContain } from "../../doesContain"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../@/components/ui/accordion"


import {
  Abfahrt,
  MilesClient,
} from "abfahrt";

import berlinDistricts from "../../data/BER-districts.geojson.json";

import berlinVehicleResponses from "../../data/vehicles.json";

import mapStyle from "../../data/mapStyle.json";

import { useEffect, useRef, useState } from "react";

import { Loader } from "@googlemaps/js-api-loader";
import { BERLIN } from "./berlin";
import dynamicMapStyles from "./dynamicMapStyles";
import { ComboboxDemo } from "../../@/components/ui/ComboBox";

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

  const [layers, setLayers] = useState<Record<string, { geoJson: any, layer: null | google.maps.Data }>>({});

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

    const map = new google.maps.Map(mapEl, {
      center: { lat: 52.520008, lng: 13.404954 },
      zoom: 10,
      styles: mapStyle as google.maps.MapTypeStyle[],
      backgroundColor: "#212121",

      // mapId: "7b1a9a576c1da12f",
    });
    mapRef.current = map;

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
        // const iconMap: Record<keyof typeof MilesVehicleType, string> = {
        //   VW_POLO: "VW_POLO",
        //   VW_ID3: "VW_ID3",
        //   OPEL_CORSA_ELEGANCE: "OPEL_CORSA_ELEGANCE",
        //   VW_POLO_2022: "VW_POLO_2022",
        //   CUPRA_BORN: "CUPRA_BORN",
        //   FORD_FIESTA: "FORD_FIESTA",
        //   OPEL_CORSA_GS: "OPEL_CORSA_GS",
        //   AUDI_A4_AVANT: "AUDI_A4_AVANT",
        //   SEAT_LEON_SPORTSTOURER: "SEAT_LEON_SPORTSTOURER",
        //   AUDI_Q2: "AUDI_Q2",
        //   VW_TAIGO: "VW_TAIGO",
        //   AUDI_Q2_S: "AUDI_Q2_S",
        //   TESLA_MODEL_Y: "TESLA_MODEL_Y",
        //   VW_ID4: "VW_ID4",
        //   TESLA_MODEL3: "TESLA_MODEL3",
        //   FORD_TRANSIT_CUSTOM_VAN: "FORD_TRANSIT_CUSTOM_VAN",
        //   FORD_TRANSIT_CUSTOM_PANEL_VAN: "FORD_TRANSIT_CUSTOM_PANEL_VAN",
        //   VW_T6: "VW_T6",
        //   VW_CRAFTER_AUTOMATIC: "VW_CRAFTER_AUTOMATIC",
        //   MERCEDES_SPRINTER: "MERCEDES_SPRINTER",
        //   VW_CRAFTER: "VW_CRAFTER",
        // }

        new google.maps.Marker({
          position: {
            lat: vehicle.Latitude,
            lng: vehicle.Longitude,
          },
          map,
          title: vehicle.LicensePlate,
          icon: {
            url: "http://localhost:3000/marker/background.svg", // url

            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0), // anchor
          },
        });
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

    const dongs: Record<string, { geoJson: any, layer: null | google.maps.Data }> = {
      "MILES:SERVICE_AREA": {

        geoJson: berlinMilesServiceAreas,

        layer: null,
      },
      "ABFAHRT:CITY_DISTRICT": {

        geoJson: refinedBerlinDistricts,

        layer: null,
      },
    }
    const activeLayers: (keyof typeof dongs)[] = ["MILES:SERVICE_AREA", "ABFAHRT:CITY_DISTRICT"];

    for (const layer of activeLayers) {

      const dataLayer = new google.maps.Data();

      dongs[layer].layer = dataLayer;

      dataLayer.setMap(map);

      dataLayer.addGeoJson(dongs[layer].geoJson, {
        idPropertyName: "name",
      })

      dataLayer.setStyle((feature) => {
        const featureData = feature.getProperty("abfahrt");

        const [vendor, entityType] = featureData.type.split(":");

        return dynamicMapStyles[vendor][entityType].default;
      });

      dataLayer.addListener("mouseover", (e) => {
        const featureData = e.feature.getProperty("abfahrt");

        // const [vendor, entityType] = featureData.type.split(":");

        // dataLayer.overrideStyle(
        //   e.feature,
        //   dynamicMapStyles[vendor][entityType].hover
        // );
        if (featureData.type === "ABFAHRT:CITY_DISTRICT") {

          setHoveredDistrict(featureData.districtId);
        }
      });
      dataLayer.addListener("mouseout", (e) => {

        const featureData = e.feature.getProperty("abfahrt");

        // dataLayer.revertStyle();

        if (featureData.type === "ABFAHRT:CITY_DISTRICT") {
          setHoveredDistrict(null)
         }
      });
    }
    setLayers(dongs)
  };

  useEffect(() => {

    const cityDistrictLayer = layers["ABFAHRT:CITY_DISTRICT"]?.layer;

    if (cityDistrictLayer) {

      cityDistrictLayer.revertStyle();

      const featureId = cityDistrictLayer.getFeatureById(hoveredDistrict)

      const hoverStyle = dynamicMapStyles["ABFAHRT"]["CITY_DISTRICT"].hover

      cityDistrictLayer.overrideStyle(
        featureId, hoverStyle);
    }
  }, [hoveredDistrict]);

  useEffect(() => {
    loadMap();
  }, []);

  return (
    <>
      <div
        js-data="google-map"
        className="w-full h-full"
        style={{
          backgroundColor: "#212121",
        }}
      />
      <div className="flex flex-col w-80 h-full bg-gray-700 border-l-gray-600 border-l-2">
        <h2>{hoveredDistrict ?? "no district selected"}</h2>
        <span>{districtInfo[hoveredDistrict] ? districtInfo[hoveredDistrict]?.vehicles?.length + " vehicles" : "-"}</span>
        <ComboboxDemo />

        <Accordion type="single" collapsible className="w-full">

          {Object.entries(districtInfo).map(([key, value]) => {

            return <AccordionItem value={key} onMouseEnter={() => {

              setHoveredDistrict(key)
            }}
              onMouseLeave={() => {

                setHoveredDistrict(null)
              }}>
              <AccordionTrigger>{key}</AccordionTrigger>
              <AccordionContent>
                {value?.vehicles?.length ?? 0} vehicles
              </AccordionContent>
            </AccordionItem>
          })}
        </Accordion>
      </div>
    </>
  );
};

export default Map;
