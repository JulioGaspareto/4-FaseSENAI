import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../config/database.js'

export async function register(req, res) {
    const { name, email, password } = req.body;

    if(
        typeof name !== "string" || name.length < 3 || 
        typeof email !== "string" || typeof password !== "string"
    ) {
        return res.status(400).json({ message: "Informe os três campos necessários para o registro" });
    }

    const [users] = await db.query("SELECT email FROM user WHERE email = ?", [email]);

    if(users.length > 0) {
        return res.status(400).json({ message: "Email já cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try{
        await db.query("INSERT INTO user (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [name, email, passwordHash, 'user']);
        return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
    }catch(error){
        return res.status(400).json({ message: "Email ou senha inválidos" })
    }
    return res.status(201).json({ message: "Usuário cadastrado com sucesso" }); 
}