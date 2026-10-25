import { useState } from 'react'
import type { FormEvent } from 'react'
import Layout from '../components/Layout'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Temporary login functionality
    console.log('Email:', email)
    console.log('Login button clicked!')
  }

  return (
    <Layout>
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
              required
            />

            <input
              type="password"
              placeholder="password"
              aria-label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}