"use client";

import { useState } from "react";
import { login } from "../services/login";

const Login = () => {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

const handleLogin = async (event: any) => {


    event.preventDefault()
    try {
        const response = await login(email, senha)

        if (response.data.success) {
            alert('Login realizado com sucesso!')
        }else{
            alert('Erro ao realizar login. Verifique suas credenciais.')
        }

    } catch (error) {
        console.error('Erro ao realizar login:', error)
    }
}

    return (
    <>
    <div>
        <form onSubmit={handleLogin}>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>
            <div>
                <label htmlFor="senha">Senha:</label>
                <input type="password" id="senha" name="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required/>
            </div>
            <button type="submit">Entrar</button>
        </form>
    </div>
    </>
    )
}

export default Login