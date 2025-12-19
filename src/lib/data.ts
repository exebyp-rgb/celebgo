import type { Event, City, Artist, Manifest } from "../types";
import { isEventFuture } from "./date";

/**
 * Read all events from static JSON file
 */
export async function getAllEvents(): Promise<Event[]> {
    try {
        const response = await import("../../data/events.json");
        return response.default || [];
    } catch (error) {
        console.warn("No events.json found, returning empty array");
        return [];
    }
}

/**
 * Get upcoming events (future only)
 */
export async function getUpcomingEvents(): Promise<Event[]> {
    const events = await getAllEvents();
    return events.filter((event) => isEventFuture(event.startDateTime));
}

/**
 * Get event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | undefined> {
    const events = await getAllEvents();
    return events.find((event) => event.slug === slug);
}

/**
 * Read all cities from static JSON file
 */
export async function getAllCities(): Promise<City[]> {
    try {
        const response = await import("../../data/cities.json");
        return response.default || [];
    } catch (error) {
        console.warn("No cities.json found, returning empty array");
        return [];
    }
}

/**
 * Get city by slug
 */
export async function getCityBySlug(slug: string): Promise<City | undefined> {
    const cities = await getAllCities();
    return cities.find((city) => city.slug === slug);
}

/**
 * Read all artists from static JSON file
 */
export async function getAllArtists(): Promise<Artist[]> {
    try {
        const response = await import("../../data/artists.json");
        return response.default || [];
    } catch (error) {
        console.warn("No artists.json found, returning empty array");
        return [];
    }
}

/**
 * Get artist by slug
 */
export async function getArtistBySlug(slug: string): Promise<Artist | undefined> {
    const artists = await getAllArtists();
    return artists.find((artist) => artist.slug === slug);
}

/**
 * Read manifest
 */
export async function getManifest(): Promise<Manifest | null> {
    try {
        const response = await import("../../data/manifest.json");
        return response.default || null;
    } catch (error) {
        console.warn("No manifest.json found");
        return null;
    }
}
