import type { Event } from "../types";

const SITE_URL = import.meta.env.SITE_URL || "https://celebgo.com";

/**
 * Generate JSON-LD Event schema for SEO
 */
export function generateEventSchema(event: Event) {
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.name,
        startDate: event.startDateTime,
        endDate: event.endDateTime,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
            "@type": "Place",
            name: event.venueName,
            address: {
                "@type": "PostalAddress",
                addressLocality: event.cityName,
                addressCountry: event.countryCode,
                ...(event.venueAddress && { streetAddress: event.venueAddress }),
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: event.lat,
                longitude: event.lng,
            },
        },
        ...(event.imageUrl && { image: event.imageUrl }),
        url: `${SITE_URL}/events/${event.slug}`,
        performer: {
            "@type": event.category === "music" ? "MusicGroup" : "Person",
            name: event.artistName,
        },
        ...(event.ticketUrl && {
            offers: {
                "@type": "Offer",
                url: event.ticketUrl,
                availability: "https://schema.org/InStock",
            },
        }),
    };
}
