/** @format */

import { useState, useEffect } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";

const VerifyEmail = () => {
  const [message, setMessages] = useState();
  const { token } = useQueryParams();
  useEffect(() => {
    const controller = new AbortController();
    if (token) {
      axios
        .post(
          "/users/verify-email",
          { email_verify_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
          }
        )
        .then((res) => {
          setMessages(res.data.message);
          if (res.data.result) {
            const { refreshToken,accessToken } = res.data.result;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
          }
        })
        .catch((err) => {
            setMessages(err.response.data.message);
        });
    }
    return () => {
      controller.abort();
    };
  }, [token]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmail;
