import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layout/HomeLayout";
import HomePage from "../pages/Home/HomePage";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import NotFound from "../pages/NotFound/NotFound";
import Profile from "../pages/Profile/Profile";
import PersonalInfo from "../pages/Profile/PersonalInfo";
import Address from "../pages/Profile/Address";
import DonationStats from "../pages/Profile/DonationStats";
import Requests from "../pages/Profile/Requests";
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
        children: [
          {
            index: true,
            Component: PersonalInfo,
          },
          {
            path: "address",
            Component: Address,
          },
          {
            path: "stats",
            Component: DonationStats,
          },
          {
            path: "requests",
            Component: Requests,
          },
        ],
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
