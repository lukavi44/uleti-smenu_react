import { Route, Routes } from "react-router-dom";

import './App.css'
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
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route element={<LoggedOutRoute />}>
              <Route path="registration" element={<RegistrationPage userType="employer" />} />
              <Route path="registration-user" element={<RegistrationPage userType="employee" />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path='oglasi-za-posao' element={<JobPosts/>} />
              <Route path="profile" element={<ProfilePage/>}/>
            </Route>
          </Routes>
        </AuthContextProvider>
      </LoadingProvider>
    </>
  )
}

export default App
