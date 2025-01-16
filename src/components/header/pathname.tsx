"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const Pathname = () => {
  const pathname = usePathname();

  // Split the pathname by "/" and filter out empty strings
  const parts = pathname.split("/").filter((part) => part !== "");

  // Capitalize each part
  const capitalizedParts = parts.map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1),
  );

  // Join the parts with spaces
  const capitalizedPathname = capitalizedParts.join("/");

  return (
    <h1 className="text-lg font-semibold text-gray-900 md:text-xl">
      {capitalizedPathname || "Home"}
    </h1>
  );
};

export default Pathname;
