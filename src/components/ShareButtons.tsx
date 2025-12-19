import { useState } from "react";

interface ShareButtonsProps {
    eventUrl: string;
    eventName: string;
    onClose: () => void;
}

export default function ShareButtons({
    eventUrl,
    eventName,
    onClose,
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async (action: "going" | "wish") => {
        const messages = {
            going: `I'm going to ${eventName}! 🎉 ${eventUrl}`,
            wish: `Wish I were at ${eventName}! 😢 ${eventUrl}`,
        };

        const message = messages[action];

        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventName,
                    text: message,
                    url: eventUrl,
                });
                onClose();
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 2000);
        }
    };

    const shareToX = (action: "going" | "wish") => {
        const messages = {
            going: `I'm going to ${eventName}! 🎉`,
            wish: `Wish I were at ${eventName}! 😢`,
        };
        const text = encodeURIComponent(messages[action]);
        const url = encodeURIComponent(eventUrl);
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            "_blank"
        );
    };

    const shareToTelegram = (action: "going" | "wish") => {
        const messages = {
            going: `I'm going to ${eventName}! 🎉`,
            wish: `Wish I were at ${eventName}! 😢`,
        };
        const text = encodeURIComponent(messages[action] + " " + eventUrl);
        window.open(`https://t.me/share/url?url=${text}`, "_blank");
    };

    return (
        <div className="mt-3 border-t pt-3">
            <p className="text-xs font-semibold mb-2">R U in?</p>

            <div className="flex gap-2 mb-2">
                <button
                    onClick={() => handleShare("going")}
                    className="flex-1 bg-green-100 text-green-700 text-xs py-2 px-2 rounded hover:bg-green-200 transition"
                >
                    I'm going
                </button>
                <button
                    onClick={() => handleShare("wish")}
                    className="flex-1 bg-yellow-100 text-yellow-700 text-xs py-2 px-2 rounded hover:bg-yellow-200 transition"
                >
                    Wish I were there
                </button>
            </div>

            {!navigator.share && (
                <div className="flex gap-2">
                    <button
                        onClick={() => shareToX("going")}
                        className="flex-1 bg-black text-white text-xs py-1 px-2 rounded hover:bg-gray-800"
                    >
                        X
                    </button>
                    <button
                        onClick={() => shareToTelegram("going")}
                        className="flex-1 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                    >
                        Telegram
                    </button>
                </div>
            )}

            {copied && (
                <p className="text-xs text-green-600 mt-2">Copied to clipboard!</p>
            )}
        </div>
    );
}
