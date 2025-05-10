import PageMeta from "../../components/common/PageMeta";
import Metrics from './Metrics';
import Schedule from "./Schedule";

export default function Home() {
    return (
        <>
            <PageMeta
                title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6">
                    <Metrics />
                </div>
                {/* <div className="col-span-12 space-y-6 xl:col-span-7">
                    <Metrics />

                    <MonthlySalesChart />
                </div> */}

                <div className="col-span-12">
                    <Schedule />
                </div>

                {/* <div className="col-span-12">
                    <StatisticsChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <DemographicCard />
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <RecentOrders />
                </div> */}
            </div>
        </>
    );
}
