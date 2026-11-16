import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool, query } from "../config/pg.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendResetEmail } from "../services/email.service.js";

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: "1d" });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      throw new AppError(409, "EMAIL_EXISTS", "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Wrong email or password");
    }

    delete user.password_hash;
    res.status(200).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const result = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const result = await query("SELECT id, name, email FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      await query("DELETE FROM password_resets WHERE user_id = $1", [user.id]);
      await query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '30 minutes')`,
        [user.id, hashToken(token)]
      );

      const link = `${env.clientUrl}/reset-password?token=${token}`;
      await sendResetEmail({ to: user.email, name: user.name, link });
    }

    res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  const client = await pool.connect();
  try {
    const { token, password } = req.body;

    await client.query("BEGIN");

    const found = await client.query(
      `SELECT user_id FROM password_resets
       WHERE token_hash = $1 AND expires_at > now()
       FOR UPDATE`,
      [hashToken(token)]
    );
    const row = found.rows[0];
    if (!row) {
      throw new AppError(400, "INVALID_TOKEN", "Reset link is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      row.user_id,
    ]);
    await client.query("DELETE FROM password_resets WHERE user_id = $1", [row.user_id]);

    await client.query("COMMIT");
    res.status(200).json({ message: "Password updated. You can log in now." });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}