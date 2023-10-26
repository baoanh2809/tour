/** @format */
import {Link} from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";



const getGoogleAuthUrl = () => {
  const {
    VITE_GOOGLE_CLIENT_ID,
    VITE_GOOGLE_REDIRECT_URI,
  } = import.meta.env;
  console.log(VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI);
  const url = `https://accounts.google.com/o/oauth2/auth`;
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URI,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ")
  };

  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}

export default function Home() {
  const oauthURL = getGoogleAuthUrl();
  console.log(oauthURL)
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  console.log(isAuthenticated)
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  };
  
  return (
    <>
      <div>
        <div>
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </div>
        <div>
          <img src={reactLogo} className="logo react" alt="React logo" />
        </div>
      </div>
      <h1>OAuth Google</h1>
      <div>
        {isAuthenticated ? (
          <div>
            <p>Xin chào, bạn đã login thành công</p>
            <button onClick={logout}>Click để logout</button>
          </div>
        ) : (
          <Link to={oauthURL}>Login with Google</Link>
        )}
      </div>
    </>
  );
}