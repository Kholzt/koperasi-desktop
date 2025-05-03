import { useEffect, useState } from "react";
import axios from './../utils/axios';
import { UserProps } from "../utils/types";

// useUser.ts
export function useUser() {
    const [user, setUser] = useState<UserProps|null>(null);

    useEffect(() => {
        const userLoc =localStorage.getItem("userLogin")? JSON.parse(localStorage.getItem("userLogin")??""):null;
        if(userLoc){
            axios.get("/api/user?id="+userLoc.id).then(res => setUser(res.data.user));
        }
    }, []);

    const saveUser = (data:any)=>{
        localStorage.setItem("userLogin", JSON.stringify(data));
    }
    return {user,saveUser};
  }
