/**
 * Device Fingerprinting Utility
 * Generates a unique-ish hash of the device based on hardware/browser signals.
 */
export const getDeviceId = async () => {
    try {
        const signals = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            !!window.indexedDB,
            typeof navigator.cpuClass,
            navigator.platform,
            navigator.doNotTrack
        ];

        // Canvas Fingerprinting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.width = 200;
            canvas.height = 40;
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("ConnectFreelance, <canvas> 1.0", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("ConnectFreelance, <canvas> 1.0", 4, 17);
            signals.push(canvas.toDataURL());
        }

        // Simple hash function (cyrb53)
        const cyrb53 = (str, seed = 0) => {
            let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
            for (let i = 0, ch; i < str.length; i++) {
                ch = str.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }
            h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
            h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
            return 4294967296 * (2097151 & h2) + (h1 >>> 0);
        };

        return cyrb53(signals.join('|')).toString(16);
    } catch (err) {
        console.error('[Fingerprint] Failed:', err);
        return 'unknown-' + Math.random().toString(36).substring(7);
    }
};
