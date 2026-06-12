import { useState, useEffect } from "react";

function calculateRelativeTime(iso) {
  if (!iso) return "";
  const normalized =
    iso instanceof Date
      ? iso.toISOString()
      : typeof iso === "string" && iso.includes("T")
        ? iso
        : typeof iso === "string"
          ? `${iso.replace(" ", "T")}Z`
          : String(iso);
  const then = new Date(normalized).getTime();
  if (Number.isNaN(then)) return iso;

  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  const dateObj = new Date(then);
  const isCurrentYear = dateObj.getFullYear() === new Date().getFullYear();
  if (!isCurrentYear) {
    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return dateObj.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function RelativeTime({ rawTime, fallback }) {
  const [timeString, setTimeString] = useState(() => {
    return rawTime ? calculateRelativeTime(rawTime) : fallback;
  });

  useEffect(() => {
    if (!rawTime) return;

    const then = new Date(
      typeof rawTime === "string" && !rawTime.includes("T")
        ? `${rawTime.replace(" ", "T")}Z`
        : rawTime
    ).getTime();

    if (Number.isNaN(then)) return;

    const updateTime = () => {
      const diffSec = Math.floor((Date.now() - then) / 1000);
      // Kill timer if older than 12 hours (43200 seconds)
      if (diffSec >= 43200) {
        if (intervalId) clearInterval(intervalId);
        return;
      }
      
      const newString = calculateRelativeTime(rawTime);
      setTimeString((prev) => (prev !== newString ? newString : prev));
    };

    let intervalId = setInterval(updateTime, 60000);
    // Do an immediate check to potentially clear instantly
    updateTime();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [rawTime]);

  return <span>{timeString}</span>;
}
