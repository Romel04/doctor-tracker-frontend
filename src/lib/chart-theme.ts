// Your Nova theme's own chart colors are all grays, so the charts use this small palette instead.
// Change the colors here and every chart updates.
export const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

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