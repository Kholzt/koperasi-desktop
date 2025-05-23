import { Route, HashRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import Area from './pages/area/Area';
import AreaForm from './pages/area/AreaForm';
import Employe from "./pages/employe/Employe";
import EmployeForm from './pages/employe/EmployeForm';
import Group from './pages/group/Group';
import GroupForm from './pages/group/GroupForm';
import Member from './pages/member/Member';
import MemberForm from './pages/member/MemberForm';
import Schedule from './pages/schedule/Schedule';
import ScheduleForm from './pages/schedule/ScheduleForm';
import User from "./pages/user/User";
import UserForm from './pages/user/UserForm';
import Loan from './pages/loan/Loan';
import LoanForm from './pages/loan/LoanForm';
import LoanDetail from './pages/loan/LoanDetail';
import Angsuran from './pages/loan/Angsuran';

export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <Routes>

                    {/* Dashboard Layout */}
                    <Route index path="/" element={<SignIn />} />
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Home />} />
                        {/* Others Page */}
                        <Route path="/user" element={<User />} />
                        <Route path="/user/create" element={<UserForm />} />
                        <Route path="/user/:id/edit" element={<UserForm />} />

                        <Route path="/employe" element={<Employe />} />
                        <Route path="/employe/create" element={<EmployeForm />} />
                        <Route path="/employe/:id/edit" element={<EmployeForm />} />

                        <Route path="/area" element={<Area />} />
                        <Route path="/area/create" element={<AreaForm />} />
                        <Route path="/area/:id/edit" element={<AreaForm />} />

                        <Route path="/group" element={<Group />} />
                        <Route path="/group/create" element={<GroupForm />} />
                        <Route path="/group/:id/edit" element={<GroupForm />} />

                        <Route path="/member" element={<Member />} />
                        <Route path="/member/create" element={<MemberForm />} />
                        <Route path="/member/:id/edit" element={<MemberForm />} />

                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/schedule/create" element={<ScheduleForm />} />
                        <Route path="/schedule/:id/edit" element={<ScheduleForm />} />

                        <Route path="/loan" element={<Loan />} />
                        <Route path="/loan/create" element={<LoanForm />} />
                        <Route path="/loan/:id/edit" element={<LoanForm />} />
                        <Route path="/loan/:id" element={<LoanDetail />} />

                        <Route path="/loan/:id/angsuran" element={<Angsuran />} />
                        <Route path="/loan/:id/angsuran/:idAngsuran" element={<Angsuran />} />


                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/blank" element={<Blank />} />

                        {/* Forms */}
                        <Route path="/form-elements" element={<FormElements />} />

                        {/* Tables */}
                        <Route path="/basic-tables" element={<BasicTables />} />

                        {/* Ui Elements */}
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/avatars" element={<Avatars />} />
                        <Route path="/badge" element={<Badges />} />
                        <Route path="/buttons" element={<Buttons />} />
                        <Route path="/images" element={<Images />} />
                        <Route path="/videos" element={<Videos />} />

                        {/* Charts */}
                        <Route path="/line-chart" element={<LineChart />} />
                        <Route path="/bar-chart" element={<BarChart />} />
                    </Route>

                    {/* Auth Layout */}
                    <Route path="/signup" element={<SignUp />} />

                    {/* Fallback Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </>
    );
}
