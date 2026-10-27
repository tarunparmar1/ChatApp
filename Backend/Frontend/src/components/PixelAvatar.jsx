import React from "react";

/**
 * PixelAvatar — renders a pixel-art face portrait from an avatar config object.
 * Pure SVG, no external dependencies.
 * Props:
 *   avatar  – the avatar object from MongoDB { config: { skinColor, hairStyle, ... } }
 *   name    – fallback name for initial if avatar is missing
 *   size    – pixel size (default 44)
 *   isOnline – show green ring
 */
function PixelAvatar({ avatar, name = "?", size = 44, isOnline = false }) {
    if (!avatar?.config) {
        // Fallback: letter avatar
        return (
            <div style={{
                width: size, height: size, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: size * 0.4, fontWeight: 700, color: "#fff",
                border: isOnline ? "2px solid #22c55e" : "2px solid #374151",
                boxShadow: isOnline ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                flexShrink: 0, userSelect: "none",
            }}>
                {name.charAt(0).toUpperCase()}
            </div>
        );
    }

    const { skinColor, hairStyle, hairColor, eyeColor, clothingColor, accessory, bgColor } = avatar.config;

    // 12x12 pixel grid, rendered as SVG rects
    const px = size / 12;

    // ── unique key counter for rect helper ──────────────────────────────────
    let keyIdx = 0;
    const rect = (col, row, color, w = 1, h = 1, tag = "px") => (
        <rect
            key={`${tag}-${keyIdx++}-${col}-${row}`}
            x={col * px}
            y={row * px}
            width={w * px}
            height={h * px}
            fill={color}
        />
    );

    // ── Hair pixels by style ─────────────────────────────────────────────────
    const hairPixels = () => {
        switch (hairStyle) {
            case "bald":
                return [];
            case "long":
                return [
                    rect(2, 1, hairColor, 8, 2, "hair-top"),
                    rect(1, 2, hairColor, 1, 5, "hair-left"),
                    rect(10, 2, hairColor, 1, 5, "hair-right"),
                ];
            case "curly":
                return [
                    rect(2, 1, hairColor, 8, 2, "hair-curly-top"),
                    rect(1, 2, hairColor, 1, 3, "hair-curly-l"),
                    rect(10, 2, hairColor, 1, 3, "hair-curly-r"),
                    rect(3, 0, hairColor, 2, 1, "hair-curly-tuft1"),
                    rect(7, 0, hairColor, 2, 1, "hair-curly-tuft2"),
                    rect(1, 1, hairColor, 1, 1, "hair-curly-ear1"),
                    rect(10, 1, hairColor, 1, 1, "hair-curly-ear2"),
                ];
            case "ponytail":
                return [
                    rect(2, 1, hairColor, 8, 2, "hair-pony-top"),
                    rect(1, 2, hairColor, 1, 2, "hair-pony-side"),
                    rect(9, 2, hairColor, 3, 1, "hair-pony-tail1"),
                    rect(10, 3, hairColor, 2, 3, "hair-pony-tail2"),
                    rect(11, 6, hairColor, 1, 2, "hair-pony-tail3"),
                ];
            case "afro":
                return [
                    rect(1, 0, hairColor, 10, 3, "hair-afro-top"),
                    rect(0, 2, hairColor, 12, 2, "hair-afro-wide"),
                    rect(1, 4, hairColor, 1, 1, "hair-afro-l"),
                    rect(10, 4, hairColor, 1, 1, "hair-afro-r"),
                ];
            default: // "short"
                return [
                    rect(2, 1, hairColor, 8, 2, "hair-short-top"),
                    rect(1, 2, hairColor, 1, 1, "hair-short-l"),
                    rect(10, 2, hairColor, 1, 1, "hair-short-r"),
                ];
        }
    };

    // ── Accessory pixels ─────────────────────────────────────────────────────
    const accessoryPixels = () => {
        switch (accessory) {
            case "glasses":
                return [
                    rect(2, 5, "#555", 2, 1, "glass-rim1"),
                    rect(5, 5, "#555", 1, 1, "glass-bridge"),
                    rect(7, 5, "#555", 2, 1, "glass-rim2"),
                    rect(10, 5, "#555", 1, 1, "glass-side1"),
                    rect(4, 5, "#333", 1, 1, "glass-lens1"),
                    rect(9, 5, "#333", 1, 1, "glass-lens2"),
                    rect(2, 4, "#555", 2, 1, "glass-top1"),
                    rect(7, 4, "#555", 2, 1, "glass-top2"),
                ];
            case "sunglasses":
                return [
                    rect(2, 5, "#1a1a1a", 3, 1, "shades-lens1"),
                    rect(6, 5, "#1a1a1a", 1, 1, "shades-bridge"),
                    rect(7, 5, "#1a1a1a", 3, 1, "shades-lens2"),
                    rect(2, 4, "#222", 3, 1, "shades-top1"),
                    rect(7, 4, "#222", 3, 1, "shades-top2"),
                    rect(5, 5, "#444", 1, 1, "shades-accent"),
                ];
            case "earrings":
                return [
                    rect(1, 6, "#FFD700", 1, 1, "earring-l"),
                    rect(10, 6, "#FFD700", 1, 1, "earring-r"),
                ];
            case "hat":
                return [
                    rect(2, 0, hairColor, 8, 1, "hat-crown"),
                    rect(1, 1, hairColor, 10, 2, "hat-brim"),
                ];
            default:
                return [];
        }
    };

    // ── Mouth ────────────────────────────────────────────────────────────────
    const mouthRow = 8;
    const mouthColor = "#a0522d";

    return (
        <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${12 * px} ${12 * px}`}
                style={{
                    borderRadius: "50%",
                    border: isOnline ? `2px solid #22c55e` : "2px solid #374151",
                    boxShadow: isOnline ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                    display: "block",
                    imageRendering: "pixelated",
                }}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background */}
                <rect width="100%" height="100%" fill={bgColor || "#1A1D29"} />

                {/* Neck */}
                {rect(4, 9, skinColor, 4, 2, "neck")}

                {/* Clothing / body */}
                {rect(1, 10, clothingColor, 10, 2, "clothes-body")}
                {rect(2, 11, clothingColor, 8, 1, "clothes-bottom")}

                {/* Face */}
                {rect(2, 3, skinColor, 8, 6, "face-main")}
                {rect(1, 4, skinColor, 1, 4, "face-side-l")}
                {rect(10, 4, skinColor, 1, 4, "face-side-r")}

                {/* Eyes - Left */}
                {rect(3, 5, "#ffffff", 1, 1, "eye-white-l")}
                {rect(4, 5, eyeColor, 1, 1, "iris-l")}
                {rect(4.2, 5, "#000000", 0.6, 1, "pupil-l")}

                {/* Eyes - Right */}
                {rect(7, 5, eyeColor, 1, 1, "iris-r")}
                {rect(8, 5, "#ffffff", 1, 1, "eye-white-r")}
                {rect(7.2, 5, "#000000", 0.6, 1, "pupil-r")}

                {/* Nose */}
                {rect(5, 7, skinColor === "#FDDBB4" ? "#e8a87c" : "#7a4a2a", 2, 1, "nose")}

                {/* Mouth */}
                {rect(4, mouthRow, mouthColor, 4, 1, "mouth-main")}
                {rect(3, mouthRow + 0.5, mouthColor, 1, 0.5, "mouth-lip-l")}
                {rect(8, mouthRow + 0.5, mouthColor, 1, 0.5, "mouth-lip-r")}

                {/* Hair */}
                {hairPixels()}

                {/* Accessories */}
                {accessoryPixels()}
            </svg>

            {/* Online dot */}
            {isOnline && (
                <span style={{
                    position: "absolute",
                    bottom: 1, right: 1,
                    width: size * 0.22,
                    height: size * 0.22,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: `2px solid #12141C`,
                    display: "block",
                }} />
            )}
        </div>
    );
}

export default PixelAvatar;
