import db from "../config/db";
const insertToPosisiUsaha = async (data) => {
    return await db("posisi_usaha").insert(data)
}
export {
    insertToPosisiUsaha
}
