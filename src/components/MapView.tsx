import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import EventPopup from "./EventPopup";

// SimpleEvent type
export type SimpleEvent = {
  id: string;
  title: string;
  importance: "major" | "medium" | "local";
  lat: number;
  lng: number;
};

type MapViewProps = {
  events: SimpleEvent[];
};

export default function MapView({ events }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  const MAPTILER_KEY = import.meta.env.PUBLIC_MAPTILER_KEY;

  // 1. Initialize map with empty GeoJSON source
  useEffect(() => {
    if (!MAPTILER_KEY) {
      console.error("[CelebGo] PUBLIC_MAPTILER_KEY is missing. Map will not be initialized.");
      return;
    }
    if (!mapContainer.current) return;

    const initMap = async () => {
      const maplibreglModule = (await import("maplibre-gl")).default;

      map.current = new maplibreglModule.Map({
        container: mapContainer.current!,
        style: `https://api.maptiler.com/maps/bright/style.json?key=${MAPTILER_KEY}`,        center: [-98, 39],
        zoom: 3,
      });

      map.current.on("load", () => {
        const emptyGeojson = { type: "FeatureCollection", features: [] as any[] };

        // Add source 'events' with empty geojson
        map.current!.addSource("events", {
          type: "geojson",
          data: emptyGeojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Cluster circles
        map.current!.addLayer({
          id: "clusters",
          type: "circle",
          source: "events",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#a855f7",
              10,
              "#8b5cf6",
              30,
              "#7c3aed",
            ],
            "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });

        // Cluster count labels
        map.current!.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "events",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Individual marker circles
        map.current!.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "events",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match",
              ["get", "importance"],
              "major",
              "#dc2626",
              "medium",
              "#a855f7",
              "local",
              "#3b82f6",
              "#a855f7",
            ],
          "circle-radius": 12,            "circle-stroke-width": 4,
            "circle-stroke-color": "#fff",
                      "circle-opacity": 0.85,
          },
        });

        // Click on clusters to zoom
        map.current!.on("click", "clusters", (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          if (!features.length) return;
          const clusterId = features[0].properties!.cluster_id;
          (map.current!.getSource("events") as any).getClusterExpansionZoom(
            clusterId,
            (err: any, zoom: number) => {
              if (err) return;
              map.current!.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom,
              });
            }
          );
        });

        // Click on individual marker to show popup
        map.current!.on("click", "unclustered-point", (e) => {
          if (!e.features || e.features.length === 0) return;
          const feature = e.features[0];
          const { x, y } = e.point;
          setSelectedEvent(feature.properties);
          setPopupPosition({ x, y });
        });

        // Cursor style
        map.current!.on("mouseenter", "clusters", () => {
          map.current!.getCanvas().style.cursor = "pointer";
        });
        map.current!.on("mouseleave", "clusters", () => {
          map.current!.getCanvas().style.cursor = "";
        });
        map.current!.on("mouseenter", "unclustered-point", () => {
          map.current!.getCanvas().style.cursor = "pointer";
        });
        map.current!.on("mouseleave", "unclustered-point", () => {
          map.current!.getCanvas().style.cursor = "";
        });
      });
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [MAPTILER_KEY]);

  // 2. Update GeoJSON when events change
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource("events") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: events.map((ev) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [ev.lng, ev.lat],
        },
        properties: {
          id: ev.id,
          title: ev.title,
          importance: ev.importance,
        },
      })),
    };

    source.setData(geojson);
  }, [events]);

  const closePopup = () => {
    setSelectedEvent(null);
    setPopupPosition(null);
  };

  if (!MAPTILER_KEY) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-100 text-gray-600 text-center px-4">
        <p>Map is temporarily unavailable. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {selectedEvent && popupPosition && (
        <EventPopup event={selectedEvent} position={popupPosition} onClose={closePopup} />
      )}
    </div>
  );
}
