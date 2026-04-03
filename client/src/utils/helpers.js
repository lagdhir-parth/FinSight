import { createElement } from "react";
import {
  FaBriefcase,
  FaBuilding,
  FaCar,
  FaLaptop,
  FaShoppingCart,
} from "react-icons/fa";
import { SlGraph } from "react-icons/sl";
import { IoFastFood } from "react-icons/io5";
import { FaBox, FaHouse, FaPlane } from "react-icons/fa6";
import { MdMovie } from "react-icons/md";
import { GiBookshelf, GiMedicinePills, GiSparkles } from "react-icons/gi";

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export const CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "business",
  "food",
  "transport",
  "rent",
  "shopping",
  "entertainment",
  "health",
  "education",
  "utilities",
  "travel",
  "other",
];

export const CATEGORY_ICONS = {
  salary: FaBriefcase,
  freelance: FaLaptop,
  investment: SlGraph,
  business: FaBuilding,
  food: IoFastFood,
  transport: FaCar,
  rent: FaHouse,
  shopping: FaShoppingCart,
  entertainment: MdMovie,
  health: GiMedicinePills,
  education: GiBookshelf,
  utilities: GiSparkles,
  travel: FaPlane,
  other: FaBox,
};

export const getCategoryIcon = (
  category,
  { customIcons = {}, fallback = "📦", props = {} } = {},
) => {
  const icon = customIcons[category] || CATEGORY_ICONS[category];

  if (!icon) return fallback;
  if (typeof icon === "string") return icon;
  if (typeof icon === "function") return createElement(icon, props);

  // Allows passing already-created React nodes in customIcons if needed.
  return icon;
};

export const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "business",
];
export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "rent",
  "shopping",
  "entertainment",
  "health",
  "education",
  "utilities",
  "travel",
  "other",
];

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";
