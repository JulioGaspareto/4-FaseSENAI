import {Router} from 'express';
import {login} from '../controller/auth.js'
import {register} from '../controller/register.js'

const router = Router();

// Rotas publicas porque não há sessão ativa
router.post('/login', login);
router.post('/register', register);

export default router;