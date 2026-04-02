import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "salary",
        "freelance",
        "investment",
        "business",
        "food",
        "transport",
        "rent",
        "shopping",
        "entertainment",
        "health",
        "education",
        "utilities",
        "travel",
        "other",
      ],
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    note: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Record = mongoose.model("Record", recordSchema);

export default Record;
