import { Route, Routes, Navigate } from "react-router-dom";

import './App.css'
import ScrollToTop from "./router/ScrollToTop";
import RootLayout from "./router/RootLayout";
import HomePage from './pages/Home/Home'
import RegistrationPage from "./pages/Registration/Registration";
import RegistrationChoicePage from "./pages/Registration/RegistrationChoice";
import LoginPage from "./pages/Login/Login";
import AuthContextProvider from "./store/Auth-context";
import RequireAuth from "./router/RequireAuth";
import LoggedOutRoute from "./router/LoggedOutRoute";
import { ToastContainer } from "react-toastify";
import { LoadingProvider } from "./store/Loading-context";
import JobPosts from "./pages/JobPosts/JobPosts";
import EmployerJobPostDetailPage from "./pages/JobPosts/EmployerJobPostDetailPage";
import ProfilePage from "./pages/Profile/Profile";
import RestaurantsPage from "./pages/Restaurants/Restaurants";
import MessagesPage from "./pages/Messages/MessagesPage";
import MessageConversationPage from "./pages/Messages/MessageConversationPage";
import AboutPage from "./pages/Info/AboutPage";
import HowItWorksPage from "./pages/Info/HowItWorksPage";
import FaqPage from "./pages/Info/FaqPage";
import ForCandidatesPage from "./pages/Info/ForCandidatesPage";
import ForEmployersPage from "./pages/Info/ForEmployersPage";
import LegalPage from "./pages/Info/LegalPage";
import EmployeePublicProfilePage from "./pages/Employees/EmployeePublicProfilePage";
import EmployerPublicProfilePage from "./pages/Employers/EmployerPublicProfilePage";
import EmployerLegacyRedirect from "./pages/Employers/EmployerLegacyRedirect";
import ReviewSubjectPage from "./pages/Reviews/ReviewSubjectPage";
import UpgradePage from "./pages/Billing/UpgradePage";
import RequireAdmin from "./router/RequireAdmin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminEmployersPage from "./pages/Admin/AdminEmployersPage";
import AdminEmployerDetailPage from "./pages/Admin/AdminEmployerDetailPage";
import AdminCandidatesPage from "./pages/Admin/AdminCandidatesPage";
import AdminRestaurantsPage from "./pages/Admin/AdminRestaurantsPage";
import AdminJobPostsPage from "./pages/Admin/AdminJobPostsPage";
import AdminApplicationsPage from "./pages/Admin/AdminApplicationsPage";
import AdminBillingPage from "./pages/Admin/AdminBillingPage";
import AdminReportsPage from "./pages/Admin/AdminReportsPage";
import AdminSettingsPage from "./pages/Admin/AdminSettingsPage";

function App() {
  return (
    <>
      <ToastContainer
        autoClose={3000}
        limit={5}
        position={"top-right"}
        closeOnClick={false}
        pauseOnHover
        theme={"light"}
        draggable={false}
      />
      <LoadingProvider>
        <AuthContextProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="for-candidates" element={<ForCandidatesPage />} />
            <Route path="for-employers" element={<ForEmployersPage />} />
            <Route path="terms" element={<LegalPage type="terms" />} />
            <Route path="privacy" element={<LegalPage type="privacy" />} />
            <Route path="cookies" element={<LegalPage type="cookies" />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="restaurants/:slug" element={<EmployerPublicProfilePage />} />
            <Route path="restaurants/:slug/reviews" element={<ReviewSubjectPage subjectType="employer" />} />
            <Route element={<LoggedOutRoute />}>
              <Route path="registration" element={<RegistrationChoicePage />} />
              <Route path="registration/candidate" element={<RegistrationPage userType="employee" />} />
              <Route path="registration/employer" element={<RegistrationPage userType="employer" />} />
              <Route path="registration-user" element={<Navigate to="/registration/candidate" replace />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="oglasi-za-posao" element={<JobPosts />} />
              <Route path="oglasi-za-posao/:jobPostId" element={<EmployerJobPostDetailPage />} />
              <Route path="messages" element={<MessagesPage/>}/>
              <Route path="messages/:conversationId" element={<MessageConversationPage/>}/>
              <Route path="employees/:employeeId" element={<EmployeePublicProfilePage/>}/>
              <Route path="employees/:employeeId/reviews" element={<ReviewSubjectPage subjectType="employee"/>}/>
              <Route path="employers/:employerId" element={<EmployerLegacyRedirect target="profile"/>}/>
              <Route path="employers/:employerId/reviews" element={<EmployerLegacyRedirect target="reviews"/>}/>
              <Route path="profile" element={<ProfilePage/>}/>
              <Route path="billing/upgrade" element={<UpgradePage/>}/>
            </Route>
            <Route element={<RequireAdmin />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/candidates" element={<AdminCandidatesPage />} />
              <Route path="admin/employers" element={<AdminEmployersPage />} />
              <Route path="admin/employers/:employerId" element={<AdminEmployerDetailPage />} />
              <Route path="admin/restaurants" element={<AdminRestaurantsPage />} />
              <Route path="admin/job-posts" element={<AdminJobPostsPage />} />
              <Route path="admin/applications" element={<AdminApplicationsPage />} />
              <Route path="admin/billing" element={<AdminBillingPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
              <Route path="admin/settings" element={<AdminSettingsPage />} />
            </Route>
            </Route>
          </Routes>
        </AuthContextProvider>
      </LoadingProvider>
    </>
  )
}

export default App
