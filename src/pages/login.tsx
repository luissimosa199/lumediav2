import React from 'react'
import { signIn } from 'next-auth/react'

const Login = () => {
  return (
    <div>
        <p>Login</p>
        <button onClick={ () => { signIn() } }>
            Entrar
        </button>
    </div>
  )
}

export default Login