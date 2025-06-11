import { useEffect, useState } from "react";
import axios from './../utils/axios';
import { UserProps } from "../utils/types";
import { useLocation } from "react-router";

// useUser.ts
export function useUser() {
    const [user, setUser] = useState<UserProps|null>(null);
    const location = useLocation();

    useEffect(() => {
        const userLoc =localStorage.getItem("userLogin")? JSON.parse(localStorage.getItem("userLogin")??""):null;
        if(userLoc){
            try {
                axios.get("/api/user?id="+userLoc.id).then(res => setUser(res.data.user));
            } catch (error) {
                console.log(error);
            }
        }
   }, [location.pathname]);

    const saveUser = (data:any)=>{
        localStorage.setItem("userLogin", JSON.stringify(data));
    }
    const removeUser = ()=>{
        localStorage.clear();
    }
    return {user,saveUser,removeUser};
  }
