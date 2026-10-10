import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({
      message: "Informe email e senha validos.",
    });
  }


  const emailNormalizado = email.trim().toLowerCase();
  const chave = `${req.ip}:${emailNormalizado}`;
  const agora = Date.now();

  let tentativa = loginAttempts.get(chave);


  if (tentativa && tentativa.lockUntil && agora >= tentativa.lockUntil) {
    loginAttempts.delete(chave);
    tentativa = undefined;
  }


  if (tentativa?.lockUntil && agora < tentativa.lockUntil) {
    const segundosRestantes = Math.ceil(
      (tentativa.lockUntil - agora) / 1000
    );


    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    return res.status(429).json({
      message: `Muitas tentativas de login. Tente novamente em ${minutos} min e ${segundos} s.`,
      retryAfter: segundosRestantes,
    });


  }


  const { rows } = await req.app.locals.db.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [emailNormalizado]
  );

  const user = rows[0];


  const senhaCorreta =
    user && (await bcrypt.compare(password, user.password_hash));


  if (!senhaCorreta) {
    if (!tentativa) {
      tentativa = {
        count: 0,
        lockUntil: null,
      };
    }


    tentativa.count += 1;

    if (tentativa.count >= MAX_ATTEMPTS) {
      tentativa.lockUntil = Date.now() + LOCK_TIME;
      loginAttempts.set(chave, tentativa);

      return res.status(429).json({
        message:
          "Você errou o email ou a senha 5 vezes. Seu login foi bloqueado por 15 minutos.",
        retryAfter: LOCK_TIME / 1000,
      });
    }

    loginAttempts.set(chave, tentativa);

    const restantes = MAX_ATTEMPTS - tentativa.count;

    return res.status(401).json({
      message: `Email ou senha incorretos. Você ainda tem ${restantes} tentativa(s) antes do bloqueio.`,
      attemptsRemaining: restantes,
    });


  }


  loginAttempts.delete(chave);


  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: "1h",
      algorithm: "HS256",
    }
  );


  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
