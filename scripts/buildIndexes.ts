import type { Event, City, Artist } from "../src/types";
import { log } from "./utils/log";

/**
 * Build cities index from events
 */
export function buildCitiesIndex(events: Event[]): City[] {
    const citiesMap = new Map<string, City>();

    events.forEach((event) => {
        if (!citiesMap.has(event.citySlug)) {
            citiesMap.set(event.citySlug, {
                slug: event.citySlug,
                name: event.cityName,
                countryCode: event.countryCode,
                lat: event.lat,
                lng: event.lng,
                eventsCount: 0,
                upcomingEventSlugs: [],
            });
        }

        const city = citiesMap.get(event.citySlug)!;
        city.eventsCount++;
        city.upcomingEventSlugs.push(event.slug);
    });

    // Sort events by date for each city
    citiesMap.forEach((city) => {
        city.upcomingEventSlugs.sort((a, b) => {
            const eventA = events.find((e) => e.slug === a);
            const eventB = events.find((e) => e.slug === b);
            if (!eventA || !eventB) return 0;
            return eventA.startDateTime.localeCompare(eventB.startDateTime);
        });
    });

    const cities = Array.from(citiesMap.values());
    log(`Built cities index: ${cities.length} cities`);

    return cities;
}

/**
 * Build artists index from events
 */
export function buildArtistsIndex(events: Event[]): Artist[] {
    const artistsMap = new Map<string, Artist>();

    events.forEach((event) => {
        if (!artistsMap.has(event.artistSlug)) {
            artistsMap.set(event.artistSlug, {
                slug: event.artistSlug,
                name: event.artistName,
                imageUrl: event.imageUrl,
                genres: [],
                eventsCount: 0,
                upcomingEventSlugs: [],
            });
        }

        const artist = artistsMap.get(event.artistSlug)!;
        artist.eventsCount++;
        artist.upcomingEventSlugs.push(event.slug);

        // Use first image found
        if (!artist.imageUrl && event.imageUrl) {
            artist.imageUrl = event.imageUrl;
        }
    });

    // Sort events by date for each artist
    artistsMap.forEach((artist) => {
        artist.upcomingEventSlugs.sort((a, b) => {
            const eventA = events.find((e) => e.slug === a);
            const eventB = events.find((e) => e.slug === b);
            if (!eventA || !eventB) return 0;
            return eventA.startDateTime.localeCompare(eventB.startDateTime);
        });
    });

    const artists = Array.from(artistsMap.values());
    log(`Built artists index: ${artists.length} artists`);

    return artists;
}
