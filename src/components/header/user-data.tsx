import { getCurrentSession } from "@/lib/session";
import UserGreeting from "./user-greeting";

const UserData=async()=>{
    const { user } = await getCurrentSession();
    if(!user) return null;
    return(
        <UserGreeting   user={user}/>
    )
}
export default UserData;