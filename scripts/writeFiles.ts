import * as fs from "fs";
import * as path from "path";
import type { Event, City, Artist, Manifest, GeoJSONFeatureCollection } from "../src/types";
import { log, error } from "./utils/log";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Ensure data directory exists
 */
export function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * Write events to JSON file
 */
export function writeEvents(events: Event[]): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, "events.json");
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    log(`Wrote ${events.length} events to ${filePath}`);
}

/**
 * Write GeoJSON file
 */
export function writeGeoJSON(geojson: GeoJSONFeatureCollection): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, "events.geojson");
    fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2));
    log(`Wrote GeoJSON with ${geojson.features.length} features to ${filePath}`);
}

/**
 * Write cities to JSON file
 */
export function writeCities(cities: City[]): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, "cities.json");
    fs.writeFileSync(filePath, JSON.stringify(cities, null, 2));
    log(`Wrote ${cities.length} cities to ${filePath}`);
}

/**
 * Write artists to JSON file
 */
export function writeArtists(artists: Artist[]): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, "artists.json");
    fs.writeFileSync(filePath, JSON.stringify(artists, null, 2));
    log(`Wrote ${artists.length} artists to ${filePath}`);
}

/**
 * Write manifest file
 */
export function writeManifest(manifest: Manifest): void {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, "manifest.json");
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
    log(`Wrote manifest to ${filePath}`);
}

/**
 * Read existing events
 */
export function readEvents(): Event[] {
    const filePath = path.join(DATA_DIR, "events.json");
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
    } catch (err) {
        error("Failed to read events.json", err);
        return [];
    }
}
