import { Route, Routes } from "react-router-dom";

import './App.css'
import ScrollToTop from "./router/ScrollToTop";
import HomePage from './pages/Home/Home'
import RegistrationPage from "./pages/Registration/Registration";
import LoginPage from "./pages/Login/Login";
import AuthContextProvider from "./store/Auth-context";
import RequireAuth from "./router/RequireAuth";
import LoggedOutRoute from "./router/LoggedOutRoute";
import { ToastContainer } from "react-toastify";
import { LoadingProvider } from "./store/Loading-context";
import JobPosts from "./pages/JobPosts/JobPosts";
import Header from "./components/Header/Header";
import ProfilePage from "./pages/Profile/Profile";
import RestaurantsPage from "./pages/Restaurants/Restaurants";
import MessagesPage from "./pages/Messages/MessagesPage";
import AboutPage from "./pages/Info/AboutPage";
import HowItWorksPage from "./pages/Info/HowItWorksPage";
import FaqPage from "./pages/Info/FaqPage";
import ForCandidatesPage from "./pages/Info/ForCandidatesPage";
import ForEmployersPage from "./pages/Info/ForEmployersPage";
import LegalPage from "./pages/Info/LegalPage";
import EmployeePublicProfilePage from "./pages/Employees/EmployeePublicProfilePage";

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
          <Header />
          <Routes>
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
            <Route element={<LoggedOutRoute />}>
              <Route path="registration" element={<RegistrationPage userType="employer" />} />
              <Route path="registration-user" element={<RegistrationPage userType="employee" />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path='oglasi-za-posao' element={<JobPosts/>} />
              <Route path="messages" element={<MessagesPage/>}/>
              <Route path="employees/:employeeId" element={<EmployeePublicProfilePage/>}/>
              <Route path="profile" element={<ProfilePage/>}/>
            </Route>
          </Routes>
        </AuthContextProvider>
      </LoadingProvider>
    </>
  )
}

export default App
