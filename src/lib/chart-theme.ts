// Chart palette: pine first, then vermilion, amber, steel blue, plum, sage.
// Change the colors here and every chart updates.
export const CHART_COLORS = ["#0e6b5c", "#e0662f", "#d9a21b", "#3f6fa8", "#7a5c99", "#5ba89b"];

// Axis labels use the theme's muted text color, so they work in light and dark mode.
export const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

// Tooltip box styled with theme variables (also works in dark mode).
export const tooltipProps = {
    contentStyle: {
        backgroundColor: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 12,
    },
    labelStyle: { color: "var(--popover-foreground)" },
    itemStyle: { color: "var(--popover-foreground)" },
};

// "2026-11-25" -> "25 Nov". The time part makes the browser read it as a local date, not UTC.
export function shortDate(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// "2026-11-25" -> "25 Nov 2026"
export function longDate(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}