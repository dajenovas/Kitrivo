export const formatPathToTitle = (pathname: string): string => {
    const cleanPath = pathname.replace(/\/$/, "");
    if (!cleanPath || cleanPath === "/") return "Dashboard";
    const segments = cleanPath.split("/").filter(Boolean);
    const moduleSegments = segments.filter((seg) => !["list", "view", "details", "index"].includes(seg.toLowerCase()));
    const targetSegment = moduleSegments.length > 0 ? moduleSegments[moduleSegments.length - 1] : segments[0];
    if (!targetSegment) return "Dashboard";
    const formatted = targetSegment.replace(/[-_]/g, " ").split(" ").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    if (!/management|settings|dashboard|profile|details|cart/i.test(formatted)) { return `${formatted} Management`; }
    return formatted;
};