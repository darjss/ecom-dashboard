import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { logout } from "@/lib/auth";

export default async function Page() {
  const { user } = await getCurrentSession();

	return ( 
     <>
     <form action={logout}>
        <button>Logout</button>
     </form>
  <h1>Hi, {user?.username}!</h1> 
  </>)
}
