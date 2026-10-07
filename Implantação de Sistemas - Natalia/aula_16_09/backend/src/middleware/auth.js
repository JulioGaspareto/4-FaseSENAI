import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
const [scheme, token] = req.headers.authorization?.split(' ') || []

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada' })
        }

    try {
        // Verifica assinatura ou validade; guarda o perfil para próxima função
        req.user = jwt.verify(token, process.env.JWT_SECRET)

    } catch (error) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada' })
    }
    next()
}

// Confere a permissão depois que o usuario foi autenticado
export const authorize = (roles) => {
    return (req, res, next) => {
        if (req.user?.roles !== roles){
            return res.status(403).json({ message: 'Acesso não autorizado' })
        }
        next()
    }
}