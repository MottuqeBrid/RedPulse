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
import MyBlogs from "../pages/Profile/MyBlogs";
import CreateBlog from "../pages/Profile/CreateBlog";
import EditBlog from "../pages/Profile/EditBlog";
import FindDonor from "../pages/FindDonor/FindDonor";
import DonorProfile from "../pages/DonorProfile/DonorProfile";
import BlogList from "../pages/Blogs/BlogList";
import BlogView from "../pages/Blogs/BlogView";

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
          {
            path: "blogs",
            Component: MyBlogs,
          },
          {
            path: "blogs/create",
            Component: CreateBlog,
          },
          {
            path: "blogs/edit/:id",
            Component: EditBlog,
          },
        ],
      },
      {
        path: "blogs",
        Component: BlogList,
      },
      {
        path: "blogs/:id",
        Component: BlogView,
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
