import { MoveActivity } from "@/lib/types";

export function getGoogleCalendarUrl(activity: MoveActivity) {
  const start = new Date(activity.start_datetime).toISOString().replace(/-|:|\.\d+/g, "");
  const end = new Date(new Date(activity.start_datetime).getTime() + 60 * 60 * 1000)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title,
    dates: `${start}/${end}`,
    details: activity.description || "",
    location: activity.location || "",
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function getAppleCalendarIcs(activity: MoveActivity) {
  const start = new Date(activity.start_datetime).toISOString().replace(/-|:|\.\d+/g, "");
  const end = new Date(new Date(activity.start_datetime).getTime() + 60 * 60 * 1000)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `URL:${window.location.href}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${activity.title}`,
    `DESCRIPTION:${activity.description || ""}`,
    `LOCATION:${activity.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export function getAllActivitiesIcs(activities: MoveActivity[]) {
  const events = activities.map(activity => {
    const start = new Date(activity.start_datetime).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(new Date(activity.start_datetime).getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d+/g, "");
    
    return [
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${activity.title}`,
      `DESCRIPTION:${activity.description || ""}`,
      `LOCATION:${activity.location || ""}`,
      "END:VEVENT"
    ].join("\n");
  });

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    ...events,
    "END:VCALENDAR"
  ].join("\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}
