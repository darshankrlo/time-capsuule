import { query } from "../config/pg.js";
import { Letter } from "../models/Letter.js";
import { AppError } from "../middleware/errorHandler.js";

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "INVALID_ID", "Invalid capsule id");
  }
  return id;
}

async function findOwned(id, userId) {
  const result = await query("SELECT * FROM capsules WHERE id = $1", [id]);
  const capsule = result.rows[0];
  if (!capsule) throw new AppError(404, "NOT_FOUND", "Capsule not found");
  if (capsule.user_id !== userId) {
    throw new AppError(403, "FORBIDDEN", "This capsule is not yours");
  }
  return capsule;
}

export async function createCapsule(req, res, next) {
  let letter;
  try {
    const { title, content, unlockAt } = req.body;

    const attachments = req.file
      ? [{ filename: req.file.originalname, path: req.file.path, mimeType: req.file.mimetype }]
      : [];

    letter = await Letter.create({ userId: req.user.id, content, attachments });

    try {
      const result = await query(
        `INSERT INTO capsules (user_id, title, mongo_letter_id, unlock_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, unlock_at, status, created_at`,
        [req.user.id, title, letter._id.toString(), unlockAt]
      );
      res.status(201).json({ capsule: result.rows[0] });
    } catch (pgErr) {
      await Letter.findByIdAndDelete(letter._id);
      throw pgErr;
    }
  } catch (err) {
    next(err);
  }
}

export async function listCapsules(req, res, next) {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.unlock_at, c.status, c.created_at,
              COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
       FROM capsules c
       LEFT JOIN capsule_tags ct ON ct.capsule_id = c.id
       LEFT JOIN tags t ON t.id = ct.tag_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.unlock_at ASC`,
      [req.user.id]
    );
    res.status(200).json({ capsules: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getCapsule(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const capsule = await findOwned(id, req.user.id);

    if (capsule.status === "locked" && new Date(capsule.unlock_at) > new Date()) {
      throw new AppError(403, "CAPSULE_LOCKED", "This capsule is still locked");
    }

    const letter = await Letter.findById(capsule.mongo_letter_id);
    res.status(200).json({
      capsule: {
        id: capsule.id,
        title: capsule.title,
        unlock_at: capsule.unlock_at,
        status: capsule.status,
        content: letter?.content ?? null,
        attachments: letter?.attachments ?? [],
        analysis: letter?.analysis ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCapsule(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const capsule = await findOwned(id, req.user.id);

    if (capsule.status !== "locked") {
      throw new AppError(409, "ALREADY_UNLOCKED", "Unlocked capsules cannot be edited");
    }

    const { title, content, unlockAt } = req.body;

    if (content !== undefined) {
      await Letter.findByIdAndUpdate(capsule.mongo_letter_id, { content });
    }

    const result = await query(
      `UPDATE capsules
       SET title = COALESCE($1, title), unlock_at = COALESCE($2, unlock_at)
       WHERE id = $3
       RETURNING id, title, unlock_at, status`,
      [title ?? null, unlockAt ?? null, id]
    );
    res.status(200).json({ capsule: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteCapsule(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const capsule = await findOwned(id, req.user.id);

    await query("DELETE FROM capsules WHERE id = $1", [id]);
    await Letter.findByIdAndDelete(capsule.mongo_letter_id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}