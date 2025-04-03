import mongoose from "mongoose";

// Define el esquema según la estructura real de tu colección "permauto"
// Por ejemplo, si tu colección almacena información de automóviles:
const PermautoSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: true,
  },
  modelo: {
    type: String,
    required: true,
  },
  año: {
    type: Number,
  },
  precio: {
    type: Number,
  },
  // Añade aquí todos los campos que existen en tu colección
});

// Importante: Este modelo apunta a la colección "permauto"
const Permauto =
  mongoose.models.permauto || mongoose.model("permauto", PermautoSchema);

export default Permauto;
