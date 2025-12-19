export type EventCategory = "music" | "festival" | "award" | "film" | "fashion";

export type Confidence = "confirmed" | "scheduled";

export type Importance = "major" | "medium" | "local";

export interface Event {
  id: string;
  slug: string;
  name: string;
  artistName: string;
  artistSlug: string;
  cityName: string;
  citySlug: string;
  countryCode: string;
  venueName: string;
  venueAddress?: string;
  lat: number;
  lng: number;
  startDateTime: string;
  endDateTime?: string;
  timezone?: string;
  category: EventCategory;
  source: "ticketmaster" | "other";
  ticketUrl?: string;
  imageUrl?: string;
  description?: string;
  importance: Importance;
  confidence: Confidence;
}

export interface City {
  slug: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  eventsCount: number;
  upcomingEventSlugs: string[];
}

export interface Artist {
  slug: string;
  name: string;
  imageUrl?: string;
  genres?: string[];
  eventsCount: number;
  upcomingEventSlugs: string[];
}

export interface Manifest {
  updatedAt: string;
  daysAhead: number;
  eventsCount: number;
  citiesCount: number;
  artistsCount: number;
  source: string[];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    slug: string;
    startDateTime: string;
    importance: Importance;
    category: EventCategory;
    artistName: string;
    cityName: string;
    venueName: string;
    imageUrl?: string;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
