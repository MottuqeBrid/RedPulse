import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layout/HomeLayout";
import HomePage from "../pages/Home/HomePage";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import NotFound from "../pages/NotFound/NotFound";
import Profile from "../pages/Profile/Profile";
import FindDonor from "../pages/FindDonor/FindDonor";
import DonorProfile from "../pages/DonorProfile/DonorProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "signup",
        Component: Signup,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "find-donor",
        Component: FindDonor,
      },
      {
        path: "donor/:id",
        Component: DonorProfile,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
