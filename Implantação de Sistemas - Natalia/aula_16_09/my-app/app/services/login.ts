import { api } from "./api"

export async function login(email: string, senha: string) {
    const response = await api.post('/login', { email, senha })
    if (!response.data.success) {
        return false
    }
    return true
}