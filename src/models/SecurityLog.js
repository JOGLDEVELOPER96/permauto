import mongoose from "mongoose";

// Especificar el nombre exacto de la colección como tercer parámetro
const SecurityLog =
  mongoose.models.SecurityLog ||
  mongoose.model(
    "SecurityLog",
    new mongoose.Schema(
      {
        type: {
          type: String,
          enum: ["entry", "exit", "other"],
          required: true,
        },
        userId: {
          type: String, // Cambiado a String ya que parece que guardas "user1" como string
          required: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: {
          type: String,
        },
        location: {
          type: String,
        },
      },
      { timestamps: true }
    ),
    "securityLogs" // Nombre exacto de la colección en MongoDB
  );

export default SecurityLog;
