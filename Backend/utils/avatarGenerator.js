/**
 * Generates a deterministic pixel-art avatar config from a seed string (user._id).
 * Same seed always produces the same avatar — unique per user, stored in MongoDB.
 */

const SKIN_COLORS   = ["#FDDBB4","#F1C27D","#C68642","#8D5524","#E8BEAC","#FFCBA4"];
const HAIR_STYLES   = ["short","long","curly","bald","ponytail","afro"];
const HAIR_COLORS   = ["#36251D","#1C1C1C","#8B4513","#D4AF37","#E8E8E8","#FF6B6B","#6A5ACD"];
const EYE_COLORS    = ["#2C3E50","#27AE60","#2980B9","#8E44AD","#E67E22","#1ABC9C"];
const CLOTHING      = ["#4F46E5","#E74C3C","#2ECC71","#F39C12","#1ABC9C","#9B59B6","#34495E"];
const ACCESSORIES   = ["none","glasses","sunglasses","earrings","hat","none","none"];
const BG_COLORS     = ["#1A1D29","#12141C","#1E2233","#16213E","#0F3460","#1B1F3B"];

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Converts a string seed to a numeric seed first.
 */
function strToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0;
    }
    return Math.abs(hash);
}

function mulberry32(seed) {
    let s = seed;
    return function () {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function pick(arr, rand) {
    return arr[Math.floor(rand() * arr.length)];
}

export function generateAvatarConfig(userId) {
    const seed   = userId.toString();
    const numSeed = strToSeed(seed);
    const rand   = mulberry32(numSeed);

    return {
        seed,
        style: "pixel",
        config: {
            skinColor:     pick(SKIN_COLORS,  rand),
            hairStyle:     pick(HAIR_STYLES,  rand),
            hairColor:     pick(HAIR_COLORS,  rand),
            eyeColor:      pick(EYE_COLORS,   rand),
            clothingColor: pick(CLOTHING,     rand),
            accessory:     pick(ACCESSORIES,  rand),
            bgColor:       pick(BG_COLORS,    rand),
        },
    };
}
