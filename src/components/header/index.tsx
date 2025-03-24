import { UserRound, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SidebarTrigger } from "../ui/sidebar";
import { Input } from "../ui/input";
import { Suspense } from "react";

import Pathname from "./pathname";
import UserData from "./user-data";

const Header = async () => {
  return (
    <header className="sticky flex  h-16 border-b  shadow-sm">
      <div className="sticky flex h-full w-full items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="text-gray-500 hover:text-gray-700" />
          <Pathname />
        </div>

        {/* Search bar - hidden on mobile, shown in dropdown */}
        <div className="relative hidden w-96 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="h-10 w-full pl-10 pr-4"
          />
          {/* <Button></Button> */}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Popover>
            <PopoverTrigger className="md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                <Search className="h-5 w-5 text-gray-600" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-screen p-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="h-10 w-full pl-10 pr-4"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <Popover>
            <PopoverTrigger>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                <UserRound className="h-5 w-5 text-gray-600" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <Suspense
                fallback={
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                }
              >
                {process.env.NODE_ENV !== "development" && <UserData />}
              </Suspense>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
