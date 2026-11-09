import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    mimeType: String,
    size: Number,
    data: Buffer,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    mood: String,
    themes: [String],
    summary: String,
    reflectionQuestion: String,
    model: String,
    tokensUsed: Number,
    analysedAt: Date,
  },
  { _id: false }
);

const letterSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  content: { type: String, required: true, maxlength: 10000 },
  attachments: { type: [attachmentSchema], default: [] },
  analysis: { type: analysisSchema, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const Letter = mongoose.model("Letter", letterSchema);