import { useState } from "react";
import MapView, { type SimpleEvent } from "./MapView";

export default function EventsExplorer() {
  const [events, setEvents] = useState<SimpleEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Log A: geo coordinates
        console.log("[CelebGo] geo:", lat, lng);

        try {
          // Fetch events from our API proxy (no date filter - get ANY events)
          const radius = 50; // miles
          const size = 50;
          const url = `/api/events?lat=${lat}&lon=${lng}&radius=${radius}&unit=miles`;

          const response = await fetch(url);
          const data = await response.json();

          // Log B: fetched events count
          console.log(
            "[CelebGo] fetched events from API:",
            data?._embedded?.events?.length ?? 0
          );

          if (
            data &&
            data._embedded &&
            data._embedded.events &&
            data._embedded.events.length > 0
          ) {
            const rawEvents = data._embedded.events;
            const mapped: SimpleEvent[] = rawEvents.map((e: any) => ({
              id: e.id,
              name: e.name || "Untitled Event",
              url: e.url || "",
              lat:
                e._embedded?.venues?.[0]?.location?.latitude
                  ? parseFloat(e._embedded.venues[0].location.latitude)
                  : 0,
              lng:
                e._embedded?.venues?.[0]?.location?.longitude
                  ? parseFloat(e._embedded.venues[0].location.longitude)
                  : 0,
              venue: e._embedded?.venues?.[0]?.name || "Unknown Venue",
              date: e.dates?.start?.localDate || "",
              imageUrl:
                e.images && e.images.length > 0 ? e.images[0].url : "",
            }));

            // Log C: total mapped events count
            console.log("[CelebGo] mapped events:", mapped.length);

            setEvents(mapped);
          } else {
            console.log("[CelebGo] No events found in the response.");
            setEvents([]);
          }
        } catch (err) {
          console.error("[CelebGo] Error fetching events:", err);
          alert("Failed to fetch events. Check console for details.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("[CelebGo] Geolocation error:", error);
        setLoading(false);
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <MapView
      events={events}
      loading={loading}
      onUseMyLocation={handleUseMyLocation}
    />
  );
}
