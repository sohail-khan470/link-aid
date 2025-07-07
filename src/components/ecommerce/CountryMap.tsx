// CountryMap.tsx
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

interface Marker {
  latLng: [number, number];
  name?: string;
}

interface CountryMapProps {
  mapColor?: string;
  markers?: Marker[];
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor, markers = [] }) => {
  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={{
        initial: {
          fill: "#465FFF",
          r: 5,
        } as any,
      }}
      markersSelectable={true}
      markers={markers}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          stroke: "none",
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
        },
        selected: {
          fill: "#465FFF",
        },
      }}
    />
  );
};

export default CountryMap;
