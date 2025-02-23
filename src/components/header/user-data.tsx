import { auth } from "@/lib/session";
import UserGreeting from "./user-greeting";

const UserData=async()=>{

    const { user } = await auth();
    if(!user) return null;
    return(
        <UserGreeting   user={user}/>
    )
}
export default UserData;