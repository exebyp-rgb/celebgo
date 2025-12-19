const SITE_URL = import.meta.env.SITE_URL || "https://celebgo.com";

/**
 * Generate page title
 */
export function generateTitle(title: string): string {
    return `${title} | CelebGo`;
}

/**
 * Generate event page title
 */
export function generateEventTitle(
    artistName: string,
    cityName: string,
    dateStr: string,
    isToday: boolean
): string {
    const when = isToday ? "tonight" : `on ${dateStr}`;
    return generateTitle(`${artistName} in ${cityName} ${when}`);
}

/**
 * Generate meta description
 */
export function generateDescription(text: string, maxLength: number = 160): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate event meta description
 */
export function generateEventDescription(
    artistName: string,
    cityName: string,
    venueName: string,
    dateStr: string
): string {
    return `${artistName} is in ${cityName} on ${dateStr}. Venue: ${venueName}. See location on map.`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
    return `${SITE_URL}${path}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImage(imageUrl?: string): string {
    return imageUrl || `${SITE_URL}/og-default.jpg`;
}
