import "dotenv/config";
import { fetchAllEvents } from "./fetchEvents";
import { buildGeoJSON } from "./buildGeojson";
import { buildCitiesIndex, buildArtistsIndex } from "./buildIndexes";
import {
    writeEvents,
    writeGeoJSON,
    writeCities,
    writeArtists,
    writeManifest,
} from "./writeFiles";
import type { Manifest } from "../src/types";
import { log, error } from "./utils/log";

/**
 * Main entry point for data fetching
 */
async function main() {
    try {
        log("=".repeat(50));
        log("CELEBGO Data Fetch Pipeline");
        log("=".repeat(50));

        // 1. Fetch events from Ticketmaster
        const events = await fetchAllEvents();

        if (events.length === 0) {
            log("No events fetched, exiting");
            return;
        }

        // Sort events by date
        events.sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

        // 2. Build GeoJSON
        const geojson = buildGeoJSON(events);

        // 3. Build city and artist indexes
        const cities = buildCitiesIndex(events);
        const artists = buildArtistsIndex(events);

        // 4. Create manifest
        const manifest: Manifest = {
            updatedAt: new Date().toISOString(),
            daysAhead: 30,
            eventsCount: events.length,
            citiesCount: cities.length,
            artistsCount: artists.length,
            source: ["ticketmaster"],
        };

        // 5. Write all files
        writeEvents(events);
        writeGeoJSON(geojson);
        writeCities(cities);
        writeArtists(artists);
        writeManifest(manifest);

        log("=".repeat(50));
        log("Data fetch completed successfully!");
        log(`Events: ${events.length}`);
        log(`Cities: ${cities.length}`);
        log(`Artists: ${artists.length}`);
        log("=".repeat(50));
    } catch (err) {
        error("Fatal error in main pipeline", err);
        process.exit(1);
    }
}

main();
