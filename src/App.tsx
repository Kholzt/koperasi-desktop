import { Route, HashRouter as Router, Routes } from "react-router";
import CheckUpdate from './CheckUpdate';
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Area from './pages/area/Area';
import AreaForm from './pages/area/AreaForm';
import Backup from './pages/backup-page/Backup';
import Category from './pages/category/Category';
import CategoryForm from './pages/category/CategoryForm';
import Employe from "./pages/employe/Employe";
import EmployeForm from './pages/employe/EmployeForm';
import Group from './pages/group/Group';
import GroupForm from './pages/group/GroupForm';
import LabaRugi from './pages/laba-rugi/LabaRugi';
import Angsuran from './pages/loan/Angsuran';
import Loan from './pages/loan/Loan';
import LoanDetail from './pages/loan/LoanDetail';
import LoanForm from './pages/loan/LoanForm';
import Member from './pages/member/Member';
import MemberForm from './pages/member/MemberForm';
import Pos from './pages/pos/Pos';
import PosForm from './pages/pos/PosForm';
import PosisiUsaha from './pages/posisi-usaha/PosisiUsaha';
import Schedule from './pages/schedule/Schedule';
import ScheduleForm from './pages/schedule/ScheduleForm';
import Transaction from './pages/transactions/Transaction';
import TransactionDetail from './pages/transactions/TransactionDetail';
import TransactionForm from './pages/transactions/TransactionForm';
import User from "./pages/user/User";
import UserForm from './pages/user/UserForm';
import LogActivity from './pages/Activity/LogActivity';

export default function App() {

    return (
        <>
            <CheckUpdate />
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

                        <Route path="/pos" element={<Pos />} />
                        <Route path="/pos/create" element={<PosForm />} />
                        <Route path="/pos/:id/edit" element={<PosForm />} />

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

                        <Route path="/transactions" element={<Transaction />} />
                        <Route path="/transactions/create" element={<TransactionForm />} />
                        <Route path="/transactions/:id/edit" element={<TransactionForm />} />
                        <Route path="/transactions/:id" element={<TransactionDetail />} />

                        <Route path="/laba-rugi" element={<LabaRugi />} />
                        <Route path="/posisi-usaha" element={<PosisiUsaha />} />


                        <Route path="/category" element={<Category />} />
                        <Route path="/category/create" element={<CategoryForm />} />
                        <Route path="/category/:id/edit" element={<CategoryForm />} />


                        <Route path="/loan/:id/angsuran" element={<Angsuran />} />
                        <Route path="/loan/:id/angsuran/:idAngsuran" element={<Angsuran />} />

                        <Route path="/backup" element={<Backup />} />

                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/blank" element={<Blank />} />

                        {/* Forms */}
                        <Route path="/form-elements" element={<FormElements />} />

                        {/* Tables */}
                        {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

                        {/* Ui Elements */}
                        {/* <Route path="/alerts" element={<Alerts />} />
                        <Route path="/avatars" element={<Avatars />} />
                        <Route path="/badge" element={<Badges />} />
                        <Route path="/buttons" element={<Buttons />} />
                        <Route path="/images" element={<Images />} />
                        <Route path="/videos" element={<Videos />} /> */}

                        {/* Charts */}
                        {/* <Route path="/line-chart" element={<LineChart />} /> */}
                        {/* <Route path="/bar-chart" element={<BarChart />} /> */}
                        <Route path="/profile" element={<UserProfiles />} />
                        <Route path="/activity" element={<LogActivity />} />
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
