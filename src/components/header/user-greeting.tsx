"use client";
import { useAction } from "@/hooks/use-action";
import { logout } from "@/lib/auth";        
import { UserSelectType } from "@/server/db/schema";
import { useActionState } from "react";

interface UserGreetingProps {
  user: UserSelectType;
}

const UserGreeting= ({user}:UserGreetingProps)=>{

    const [action, isPending]=useAction(logout)
    return(
        <div className="space-y-4 p-2">
        <div className="font-medium text-gray-900">{user?.username}</div>
        <form action={action}>
          <button className="w-full rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </form>
      </div>
    )
}
export default UserGreeting;