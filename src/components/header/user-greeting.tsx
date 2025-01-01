import { logout } from "@/lib/auth";
import { getCurrentSession } from "@/lib/session";

const UserGreeting=async ()=>{
    const { user } = await getCurrentSession();
    return(
        <div className="space-y-4 p-2">
        <div className="font-medium text-gray-900">{user?.username}</div>
        <form action={logout}>
          <button className="w-full rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Logout
          </button>
        </form>
      </div>
    )
}
export default UserGreeting;