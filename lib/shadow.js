import { Platform } from "react-native";

/**
 * Cross-platform shadow helper.
 * Uses boxShadow on web (RN Web deprecates shadow* props).
 * Uses native shadow props on iOS/Android.
 *
 * @param {object} opts
 * @param {string}  opts.color   - shadow color hex
 * @param {number}  opts.opacity - 0–1
 * @param {number}  opts.radius  - blur radius
 * @param {number}  opts.y       - vertical offset
 */
export function shadow({ color = "#000", opacity = 0.1, radius = 12, y = 4 } = {}) {
  if (Platform.OS === "web") {
    // Convert hex + opacity to rgba for boxShadow
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return { boxShadow: `0px ${y}px ${radius}px rgba(${r},${g},${b},${opacity})` };
  }
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: y },
    elevation: Math.round(radius / 2),
  };
}

// Preset shadows
export const shadows = {
  sm:   shadow({ opacity: 0.06, radius: 8,  y: 2 }),
  md:   shadow({ opacity: 0.08, radius: 12, y: 4 }),
  lg:   shadow({ opacity: 0.12, radius: 20, y: 8 }),
  amber: shadow({ color: "#F59E0B", opacity: 0.45, radius: 16, y: 4 }),
  dark:  shadow({ color: "#1A1F2E", opacity: 0.08, radius: 12, y: 4 }),
};
