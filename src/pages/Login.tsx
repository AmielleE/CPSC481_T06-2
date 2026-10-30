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
    // Redirect to Home page without checking credentials
    navigate('/')
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <h1>Hi John Doe!</h1>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="email"
            aria-label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            placeholder="password"
            aria-label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

      </div>
    </div>
  )
}