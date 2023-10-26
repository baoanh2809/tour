/** @format */

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Home from "./Home";
import Login from "./Login";
import VerifyEmail from "./verifyEmail";
import VerifyForgotPasswordToken from "./ResetPassword";
import { ResetPassword } from "./ResetPassword";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login/oauth",
    element: <Login />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/forgot-password",
    element: <VerifyForgotPasswordToken />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  }
]);

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("root");
  if (!container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    );
  }
});
export default router;
