import type { Event, GeoJSONFeatureCollection, GeoJSONFeature } from "../src/types";
import { log } from "./utils/log";

/**
 * Build GeoJSON FeatureCollection from events
 */
export function buildGeoJSON(events: Event[]): GeoJSONFeatureCollection {
    const features: GeoJSONFeature[] = events.map((event) => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [event.lng, event.lat],
        },
        properties: {
            slug: event.slug,
            startDateTime: event.startDateTime,
            importance: event.importance,
            category: event.category,
            artistName: event.artistName,
            cityName: event.cityName,
            venueName: event.venueName,
            imageUrl: event.imageUrl,
        },
    }));

    log(`Built GeoJSON with ${features.length} features`);

    return {
        type: "FeatureCollection",
        features,
    };
}
