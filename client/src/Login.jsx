/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    const accessToken = params.get("accessToken")
    const refreshToken = params.get("refreshToken")
    const new_user = params.get("new_user")
    const verify = params.get("verify");
    console.log(new_user,verify);
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken);
    navigate("/")
  }, [params, navigate])
  return (
    <div>Login</div>
  )
}
