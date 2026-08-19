import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Metrics from './Metrics';
import Schedule from "./Schedule";
import axios from "../../utils/axios";
export default function Home() {

    useEffect(() => {
        axios.post("/api/export-db").catch(e=>console.log(e))
    }, []);
    return (
        <>
            <PageMeta
                title={`Dashboard | ${import.meta.env.VITE_APP_NAME}`}
                description={`Dashboard | ${import.meta.env.VITE_APP_NAME}`}
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6">
                    <Metrics />
                </div>


                <div className="col-span-12">
                    <Schedule />
                </div>

            </div>
        </>
    );
}
