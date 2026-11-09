import cron from "node-cron";
import { pool, query } from "../config/pg.js";
import { Letter } from "../models/Letter.js";
import { analyseLetter } from "../services/llm.service.js";
import { sendUnlockEmail } from "../services/email.service.js";

let running = false;

async function markUnlocked(capsuleId, themes) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE capsules SET status = 'unlocked' WHERE id = $1", [capsuleId]);

    for (const theme of themes) {
      const tag = await client.query(
        `INSERT INTO tags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [theme.trim().toLowerCase()]
      );
      await client.query(
        `INSERT INTO capsule_tags (capsule_id, tag_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [capsuleId, tag.rows[0].id]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function unlockDueCapsules() {
  if (running) return;
  running = true;

  try {
    const due = await query(
      `SELECT c.id, c.title, c.mongo_letter_id, u.email, u.name
       FROM capsules c
       JOIN users u ON u.id = c.user_id
       WHERE c.status = 'locked' AND c.unlock_at <= now()`
    );
    console.log(`Unlock job: ${due.rows.length} capsule(s) due`);

    for (const capsule of due.rows) {
      try {
        const letter = await Letter.findById(capsule.mongo_letter_id);
        let analysis = null;

        if (letter) {
          analysis = await analyseLetter(letter.content);
          if (analysis) {
            letter.analysis = analysis;
            await letter.save();
          }
        }

        await markUnlocked(capsule.id, analysis?.themes ?? []);

        const sent = await sendUnlockEmail({
          to: capsule.email,
          name: capsule.name,
          title: capsule.title,
        });
        if (sent) {
          await query("UPDATE capsules SET email_sent = true WHERE id = $1", [capsule.id]);
        }
      } catch (err) {
        console.error(`Failed to unlock capsule ${capsule.id}:`, err.message);
      }
    }
  } finally {
    running = false;
  }
}

export function startUnlockJob() {
  cron.schedule("*/5 * * * *", () => {
    unlockDueCapsules().catch((err) => console.error("Unlock job error:", err.message));
  });
  console.log("Unlock job scheduled (every 5 minutes)");
}