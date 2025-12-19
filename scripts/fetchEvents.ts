import type { Event, EventCategory, Importance, Confidence } from "../src/types";
import { fetchWithRetry, RateLimiter } from "./utils/http";
import { log, error, warn } from "./utils/log";
import { slugify, generateEventSlug } from "../src/lib/slug";

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// Countries to fetch events from
const COUNTRIES = ["US", "CA", "GB", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK", "PL", "UA"];

// Days ahead to fetch
const DAYS_AHEAD = 30;

const rateLimiter = new RateLimiter(5, 250); // 5 concurrent, 250ms between requests

interface TicketmasterEvent {
    id: string;
    name: string;
    dates: {
        start: {
            localDate: string;
            localTime?: string;
            dateTime?: string;
        };
        end?: {
            localDate?: string;
            localTime?: string;
            dateTime?: string;
        };
        timezone?: string;
    };
    classifications?: Array<{
        segment?: { name: string };
        genre?: { name: string };
    }>;
    _embedded?: {
        venues?: Array<{
            name: string;
            address?: { line1?: string };
            city?: { name: string };
            country?: { countryCode: string };
            location?: {
                latitude: string;
                longitude: string;
            };
        }>;
        attractions?: Array<{
            name: string;
            images?: Array<{ url: string; width: number; height: number }>;
        }>;
    };
    images?: Array<{ url: string; width: number; height: number }>;
    url?: string;
    info?: string;
}

/**
 * Fetch events from Ticketmaster API for a specific country
 */
async function fetchEventsForCountry(countryCode: string): Promise<Event[]> {
    const events: Event[] = [];
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + DAYS_AHEAD);

    const startDateTime = now.toISOString().split("T")[0] + "T00:00:00Z";
    const endDateTime = endDate.toISOString().split("T")[0] + "T23:59:59Z";

    let page = 0;
    const size = 200; // Max per page
    let hasMore = true;

    while (hasMore) {
        try {
            const url = `${BASE_URL}/events.json?apikey=${API_KEY}&countryCode=${countryCode}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&size=${size}&page=${page}&sort=date,asc`;

            const response = await rateLimiter.execute(() => fetchWithRetry(url));
            const data = await response.json();

            if (data._embedded?.events) {
                const normalizedEvents = data._embedded.events
                    .map((event: TicketmasterEvent) => normalizeEvent(event))
                    .filter((event: Event | null) => event !== null) as Event[];

                events.push(...normalizedEvents);
                log(
                    `Fetched page ${page} for ${countryCode}: ${normalizedEvents.length} events`
                );
            }

            // Check if there are more pages
            const totalPages = data.page?.totalPages || 1;
            page++;

            if (page >= totalPages || page >= 50) {
                // Safety limit: max 50 pages per country
                hasMore = false;
            }
        } catch (err) {
            error(`Failed to fetch events for ${countryCode} page ${page}`, err);
            hasMore = false;
        }
    }

    log(`Total events for ${countryCode}: ${events.length}`);
    return events;
}

/**
 * normalized a Ticketmaster event to our Event model
 */
function normalizeEvent(tmEvent: TicketmasterEvent): Event | null {
    try {
        const venue = tmEvent._embedded?.venues?.[0];
        const attraction = tmEvent._embedded?.attractions?.[0];

        if (!venue || !venue.location) {
            warn(`Event ${tmEvent.id} missing venue or location, skipping`);
            return null;
        }

        const cityName = venue.city?.name;
        const countryCode = venue.country?.countryCode;

        if (!cityName || !countryCode) {
            warn(`Event ${tmEvent.id} missing city or country, skipping`);
            return null;
        }

        const artistName = attraction?.name || tmEvent.name.split(" at ")[0] || tmEvent.name;
        const lat = parseFloat(venue.location.latitude);
        const lng = parseFloat(venue.location.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            warn(`Event ${tmEvent.id} has invalid coordinates, skipping`);
            return null;
        }

        // Determine start date/time
        let startDateTime: string;
        if (tmEvent.dates.start.dateTime) {
            startDateTime = tmEvent.dates.start.dateTime;
        } else {
            const time = tmEvent.dates.start.localTime || "20:00:00";
            startDateTime = `${tmEvent.dates.start.localDate}T${time}`;
        }

        // Determine end date/time
        let endDateTime: string | undefined;
        if (tmEvent.dates.end?.dateTime) {
            endDateTime = tmEvent.dates.end.dateTime;
        }

        // Get category
        const category = determineCategory(tmEvent.classifications);

        // Get image
        const imageUrl = getBestImage(tmEvent.images || attraction?.images);

        // Generate slugs
        const artistSlug = slugify(artistName);
        const citySlug = slugify(cityName);
        const eventSlug = generateEventSlug(
            artistName,
            cityName,
            startDateTime,
            tmEvent.id
        );

        // Determine importance
        const importance = determineImportance(venue.name, category);

        const event: Event = {
            id: tmEvent.id,
            slug: eventSlug,
            name: tmEvent.name,
            artistName,
            artistSlug,
            cityName,
            citySlug,
            countryCode,
            venueName: venue.name,
            venueAddress: venue.address?.line1,
            lat,
            lng,
            startDateTime,
            endDateTime,
            timezone: tmEvent.dates.timezone,
            category,
            source: "ticketmaster",
            ticketUrl: tmEvent.url,
            imageUrl,
            description: tmEvent.info?.slice(0, 600),
            importance,
            confidence: "confirmed",
        };

        return event;
    } catch (err) {
        error(`Failed to normalize event ${tmEvent.id}`, err);
        return null;
    }
}

/**
 * Determine event category from classifications
 */
function determineCategory(
    classifications?: Array<{ segment?: { name: string }; genre?: { name: string } }>
): EventCategory {
    if (!classifications || classifications.length === 0) {
        return "music";
    }

    const segment = classifications[0].segment?.name?.toLowerCase() || "";
    const genre = classifications[0].genre?.name?.toLowerCase() || "";

    if (segment.includes("music") || genre.includes("music")) return "music";
    if (segment.includes("festival")) return "festival";
    if (segment.includes("award")) return "award";
    if (segment.includes("film")) return "film";
    if (segment.includes("fashion")) return "fashion";

    return "music"; // Default
}

/**
 * Get best quality image
 */
function getBestImage(
    images?: Array<{ url: string; width: number; height: number }>
): string | undefined {
    if (!images || images.length === 0) return undefined;

    // Sort by resolution (width * height), prefer larger images
    const sorted = [...images].sort((a, b) => b.width * b.height - a.width * a.height);

    return sorted[0]?.url;
}

/**
 * Determine event importance based on venue name and category
 */
function determineImportance(venueName: string, category: EventCategory): Importance {
    const venueLower = venueName.toLowerCase();

    // Major keywords
    const majorKeywords = [
        "stadium",
        "arena",
        "amphitheatre",
        "amphitheater",
        "festival",
        "bowl",
        "center",
        "centre",
        "palace",
    ];

    // Local keywords
    const localKeywords = [
        "club",
        "bar",
        "pub",
        "cafe",
        "lounge",
        "restaurant",
    ];

    if (category === "festival" || category === "award") {
        return "major";
    }

    if (majorKeywords.some((keyword) => venueLower.includes(keyword))) {
        return "major";
    }

    if (localKeywords.some((keyword) => venueLower.includes(keyword))) {
        return "local";
    }

    return "medium";
}

/**
 * Main function to fetch all events
 */
export async function fetchAllEvents(): Promise<Event[]> {
    if (!API_KEY) {
        throw new Error("TICKETMASTER_API_KEY environment variable is not set");
    }

    log("Starting Ticketmaster event fetch...");
    log(`Countries: ${COUNTRIES.join(", ")}`);
    log(`Days ahead: ${DAYS_AHEAD}`);

    const allEvents: Event[] = [];

    for (const country of COUNTRIES) {
        const events = await fetchEventsForCountry(country);
        allEvents.push(...events);
    }

    log(`Total events fetched: ${allEvents.length}`);

    // Deduplicate by ID
    const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.id, event])).values()
    );

    log(`Unique events after deduplication: ${uniqueEvents.length}`);

    return uniqueEvents;
}
