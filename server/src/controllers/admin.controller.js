import { query } from "../config/pg.js";
import { Letter } from "../models/Letter.js";

export async function getStats(req, res, next) {
  try {
    const [users, capsules, perDay] = await Promise.all([
      query("SELECT COUNT(*)::int AS total FROM users"),
      query("SELECT status, COUNT(*)::int AS total FROM capsules GROUP BY status"),
      query(
        `SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS total
         FROM capsules
         WHERE created_at > now() - interval '7 days'
         GROUP BY day
         ORDER BY day`
      ),
    ]);

    // Mongo aggregation pipeline: LLM token usage and mood breakdown
    const [tokenUsage, moods] = await Promise.all([
      Letter.aggregate([
        { $match: { analysis: { $ne: null } } },
        {
          $group: {
            _id: null,
            analysedLetters: { $sum: 1 },
            totalTokens: { $sum: "$analysis.tokensUsed" },
          },
        },
      ]),
      Letter.aggregate([
        { $match: { analysis: { $ne: null } } },
        { $group: { _id: "$analysis.mood", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      users: users.rows[0].total,
      capsulesByStatus: capsules.rows,
      capsulesLast7Days: perDay.rows,
      llm: {
        analysedLetters: tokenUsage[0]?.analysedLetters ?? 0,
        totalTokens: tokenUsage[0]?.totalTokens ?? 0,
      },
      topMoods: moods.map((m) => ({ mood: m._id, count: m.count })),
    });
  } catch (err) {
    next(err);
  }
}