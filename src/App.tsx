import React, { Suspense } from "react";
import { Route, HashRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

const Blank = React.lazy(() => import("./pages/Blank"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const Home = React.lazy(() => import("./pages/Dashboard/Home"));
const FormElements = React.lazy(() => import("./pages/Forms/FormElements"));
const UserProfiles = React.lazy(() => import("./pages/UserProfiles"));
const Area = React.lazy(() => import('./pages/area/Area'));
const AreaForm = React.lazy(() => import('./pages/area/AreaForm'));
const Backup = React.lazy(() => import('./pages/backup-page/Backup'));
const Category = React.lazy(() => import('./pages/category/Category'));
const CategoryForm = React.lazy(() => import('./pages/category/CategoryForm'));
const Employe = React.lazy(() => import("./pages/employe/Employe"));
const EmployeForm = React.lazy(() => import('./pages/employe/EmployeForm'));
const Group = React.lazy(() => import('./pages/group/Group'));
const GroupForm = React.lazy(() => import('./pages/group/GroupForm'));
const LabaRugi = React.lazy(() => import('./pages/laba-rugi/LabaRugi'));
const Angsuran = React.lazy(() => import('./pages/loan/Angsuran'));
const Loan = React.lazy(() => import('./pages/loan/Loan'));
const LoanDetail = React.lazy(() => import('./pages/loan/LoanDetail'));
const LoanForm = React.lazy(() => import('./pages/loan/LoanForm'));
const Member = React.lazy(() => import('./pages/member/Member'));
const MemberForm = React.lazy(() => import('./pages/member/MemberForm'));
const Pos = React.lazy(() => import('./pages/pos/Pos'));
const PosForm = React.lazy(() => import('./pages/pos/PosForm'));
const PosisiUsaha = React.lazy(() => import('./pages/posisi-usaha/PosisiUsaha'));
const Schedule = React.lazy(() => import('./pages/schedule/Schedule'));
const ScheduleForm = React.lazy(() => import('./pages/schedule/ScheduleForm'));
const Transaction = React.lazy(() => import('./pages/transactions/Transaction'));
const TransactionDetail = React.lazy(() => import('./pages/transactions/TransactionDetail'));
const TransactionForm = React.lazy(() => import('./pages/transactions/TransactionForm'));
const User = React.lazy(() => import("./pages/user/User"));
const UserForm = React.lazy(() => import('./pages/user/UserForm'));
const LogActivity = React.lazy(() => import('./pages/Activity/LogActivity'));

export default function App() {

    return (
        <>
            {/* <CheckUpdate /> */}
            <Router>
                <ScrollToTop />
                <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
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
                </Suspense>
            </Router>

        </>
    );
}
