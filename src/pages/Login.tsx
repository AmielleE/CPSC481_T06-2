import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Temporary login functionality
    // Redirect to Home without checking credentials
    navigate('/')
  }

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Photographer branding */}
        <div className="login-brand">
          <h1>John Doe</h1>
          <p>PHOTOGRAPHY</p>
        </div>

        {/* Divider */}
        <div className="login-divider"></div>

        {/* Login section */}
        <div className="login-section">

          <h2>WELCOME BACK</h2>

          <form onSubmit={handleLogin} className="login-form">

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">EMAIL</label>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">PASSWORD</label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {/* Login button */}
            <button type="submit" className="login-button">
              LOGIN
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}