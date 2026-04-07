// Date formatting
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Get background color for avatar from name (deterministic)
export const getAvatarColor = (name) => {
  const colors = [
    "bg-brand-600",
    "bg-purple-600",
    "bg-teal-600",
    "bg-orange-600",
    "bg-pink-600",
    "bg-blue-600",
    "bg-green-600",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

// Status display labels
export const STATUS_LABELS = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

// Extract error message from API error response
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";
  if (typeof error === "string") return error;
  if (error.detail) return error.detail;
  return Object.values(error).flat().join(" ");
};
