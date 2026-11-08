import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../config/pg.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: "1d" });

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