import { useState } from "react";
import MapView, { type SimpleEvent } from "./MapView";

export default function EventsExplorer() {
  const [events, setEvents] = useState<SimpleEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const TICKETMASTER_KEY = import.meta.env.PUBLIC_TICKETMASTER_KEY;

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
          // Fetch events from Ticketmaster (no date filter - get ANY events)
          const radius = 50; // miles
          const size = 50;
          const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&latlong=${lat},${lng}&radius=${radius}&size=${size}&unit=miles`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          // Log B: fetched events count
          const fetchedEvents = data._embedded?.events || [];
          console.log("[CelebGo] fetched events:", fetchedEvents.length);

          // Convert to SimpleEvent format
          const normalized: SimpleEvent[] = fetchedEvents
            .filter((e: any) => e._embedded?.venues?.[0]?.location)
            .map((e: any) => {
              const venue = e._embedded.venues[0];
              return {
                id: e.id,
                title: e.name,
                importance: "local" as const,
                lat: parseFloat(venue.location.latitude),
                lng: parseFloat(venue.location.longitude),
              };
            });

          setEvents(normalized);
          
          // Log C: passing to MapView
          console.log("[CelebGo] passing to MapView events:", normalized.length);
        } catch (error) {
          console.error("[CelebGo] Error fetching events:", error);
          alert("Failed to fetch events. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("[CelebGo] Geolocation error:", error);
        alert("Failed to get your location. Please enable location access.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      <MapView events={events} />
      
      {/* Use My Location Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
        >
          {loading ? "Loading..." : "Use my location"}
        </button>
      </div>
    </div>
  );
}
