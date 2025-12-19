/**
 * Converts a string to a URL-safe slug
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Remove accents/diacritics
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        // Replace spaces with hyphens
        .replace(/\s+/g, "-")
        // Remove all non-alphanumeric characters except hyphens
        .replace(/[^a-z0-9-]/g, "")
        // Remove consecutive hyphens
        .replace(/-+/g, "-")
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, "");
}

/**
 * Generates an event slug in the format: artist-city-YYYY-MM-DD
 * If collision occurs, adds -id suffix
 */
export function generateEventSlug(
    artistName: string,
    cityName: string,
    startDate: string,
    eventId?: string
): string {
    const artistSlug = slugify(artistName);
    const citySlug = slugify(cityName);
    const dateStr = startDate.split("T")[0]; // Extract YYYY-MM-DD

    const baseSlug = `${artistSlug}-${citySlug}-${dateStr}`;

    // If collision handling is needed, add event ID suffix
    if (eventId) {
        const idSuffix = eventId.slice(-6);
        return `${baseSlug}-${idSuffix}`;
    }

    return baseSlug;
}
