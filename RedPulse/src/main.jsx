import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router/route.js";
import AuthProvider from "./Context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ToastContainer />
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
);
