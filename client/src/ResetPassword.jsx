/** @format */

import { useState, useEffect } from "react";
import useQueryParams from "./useQueryParams";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function VerifyForgotPasswordToken() {
  const [message, setMessages] = useState("");
  const { token } = useQueryParams();
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    if (token) {
      axios
        .post(
          "/users/verify-forgot-password",
          { forgotPasswordToken: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
          }
        )
        .then(() => {
          navigate("/reset-password", {
            state: { forgotPasswordToken: token },
          });
        })
        .catch((err) => {
          setMessages(err.response.data.message);
        });
    }
    return () => {
      controller.abort();
    };
  }, [token, navigate]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export function ResetPassword() {
  const location = useLocation();
  console.log(location.state);
  return (
    <div>
      <h1>Reset Password</h1>
      <form>
        <div>
          <input type="password" placeholder="password" />
        </div>
        <div>
          <input type="password" placeholder="confirm password" />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
