"use client";
import { usePathname } from "next/navigation";

const Pathname = () => {
  const pathname = usePathname().split("/")[1];
  
  const capitalizedPathname = pathname
    ? pathname.charAt(0).toUpperCase() + pathname.slice(1)
    : 'Home';

  return (
    <h1 className="text-lg font-semibold text-gray-900 md:text-xl">
      {capitalizedPathname}
    </h1>
  );
};

export default Pathname;