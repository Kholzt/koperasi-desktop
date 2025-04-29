import { useEffect, useState } from "react";
import axios from './../utils/axios';
import { UserProps } from "../utils/types";

// useUser.ts
export function useUser() {
    const [user, setUser] = useState<UserProps>(null);

    useEffect(() => {
        const userLoc = JSON.parse(localStorage.getItem("userLogin")??"");
        axios.get("/api/user?id="+userLoc.id).then(res => setUser(res.data.user)
        );
    }, []);

    return {user};
  }
