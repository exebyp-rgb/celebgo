import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import EventPopup from "./EventPopup";

interface MapViewProps {
    maptilerKey: string;
}

export default function MapView({ maptilerKey }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const initMap = async () => {
            const maplibregl = (await import("maplibre-gl")).default;

            map.current = new maplibregl.Map({
                container: mapContainer.current!,
                style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
                center: [-98, 39], // Center of US
                zoom: 3,
            });

            map.current.on("load", async () => {
                // Fetch GeoJSON data
                const response = await fetch("/data/events.geojson");
                const geojson = await response.json();

                // Add source
                map.current!.addSource("events", {
                    type: "geojson",
                    data: geojson,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                });

                // Add cluster circles
                map.current!.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "events",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": [
                            "step",
                            ["get", "point_count"],
                            "#a855f7", // purple-500
                            10,
                            "#8b5cf6", // purple-600
                            30,
                            "#7c3aed", // purple-700
                        ],
                        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                // Add cluster count labels
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

                // Add unclustered points
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
                            "#dc2626", // red-600
                            "medium",
                            "#a855f7", // purple-500
                            "local",
                            "#3b82f6", // blue-500
                            "#a855f7",
                        ],
                        "circle-radius": 8,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                });

                // Click on cluster: zoom in
                map.current!.on("click", "clusters", (e) => {
                    const features = map.current!.queryRenderedFeatures(e.point, {
                        layers: ["clusters"],
                    });
                    const clusterId = features[0].properties.cluster_id;
                    (map.current!.getSource("events") as any).getClusterExpansionZoom(
                        clusterId,
                        (err: any, zoom: number) => {
                            if (err) return;

                            map.current!.easeTo({
                                center: (features[0].geometry as any).coordinates,
                                zoom: zoom,
                            });
                        }
                    );
                });

                // Click on unclustered point: show popup
                map.current!.on("click", "unclustered-point", (e) => {
                    if (!e.features || e.features.length === 0) return;

                    const feature = e.features[0];
                    const { x, y } = e.point;

                    setSelectedEvent(feature.properties);
                    setPopupPosition({ x, y });
                });

                // Change cursor on hover
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
    }, [maptilerKey]);

    const closePopup = () => {
        setSelectedEvent(null);
        setPopupPosition(null);
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {selectedEvent && popupPosition && (
                <EventPopup
                    event={selectedEvent}
                    position={popupPosition}
                    onClose={closePopup}
                />
            )}
        </div>
    );
}
