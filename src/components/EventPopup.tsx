import { useState } from "react";
import ShareButtons from "./ShareButtons";

interface EventPopupProps {
    event: any;
    position: { x: number; y: number };
    onClose: () => void;
}

export default function EventPopup({ event, position, onClose }: EventPopupProps) {
    const [showShare, setShowShare] = useState(false);

    const eventUrl = `/events/${event.slug}`;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Popup */}
            <div
                className="fixed z-50 bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{
                    left: position.x + 10,
                    top: position.y - 100,
                    maxWidth: "300px",
                }}
            >
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.artistName}
                        className="w-full h-32 object-cover"
                    />
                )}

                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{event.artistName}</h3>
                    <p className="text-sm text-gray-600 mb-1">{event.venueName}</p>
                    <p className="text-xs text-gray-500 mb-3">
                        {event.cityName} • {new Date(event.startDateTime).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                        <a
                            href={eventUrl}
                            className="flex-1 bg-purple-600 text-white text-sm py-2 px-3 rounded hover:bg-purple-700 transition text-center"
                        >
                            View Event
                        </a>
                        <button
                            onClick={() => setShowShare(!showShare)}
                            className="bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-300 transition"
                        >
                            R U in?
                        </button>
                    </div>

                    {showShare && (
                        <ShareButtons
                            eventUrl={`https://celebgo.com${eventUrl}`}
                            eventName={`${event.artistName} in ${event.cityName}`}
                            onClose={() => setShowShare(false)}
                        />
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
                >
                    ×
                </button>
            </div>
        </>
    );
}
