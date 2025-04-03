// app/api/authorizations/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Conectar a la base de datos
async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw new Error("Error al conectar a la base de datos");
  }
}

// Definir el esquema de autorización si no existe
let Authorization;
try {
  Authorization = mongoose.model("Authorization");
} catch (error) {
  const AuthorizationSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    ruc: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["initiated", "completed", "approved", "rejected"],
      default: "initiated",
    },
    userId: { type: String, required: true },
    approvedBy: { type: String, default: "pending" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timestamp: { type: Date, default: Date.now },
  });

  Authorization = mongoose.model("Authorization", AuthorizationSchema);
}

export async function GET(request) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const userId = url.searchParams.get("userId");

    // Construir filtro
    const filter = {};

    // Si se proporciona un estado, filtrar por él
    if (status) {
      filter.status = status;
    }

    // Si se proporciona un userId, filtrar por él
    if (userId) {
      filter.userId = userId;
    }

    // Obtener autorizaciones
    const authorizations = await Authorization.find(filter).sort({
      timestamp: -1,
    });

    // Responder con las autorizaciones
    return NextResponse.json({ authorizations });
  } catch (error) {
    console.error("Error al obtener autorizaciones:", error);
    return NextResponse.json(
      { message: "Error al obtener las autorizaciones", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener datos del cuerpo de la solicitud
    const data = await request.json();

    // Validar datos
    if (
      !data.companyName ||
      !data.ruc ||
      !data.reason ||
      !data.userId ||
      !data.startDate ||
      !data.endDate
    ) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Crear nueva autorización
    const newAuthorization = new Authorization({
      companyName: data.companyName,
      ruc: data.ruc,
      reason: data.reason,
      status: "initiated",
      userId: data.userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    // Guardar autorización
    await newAuthorization.save();

    // Responder con la autorización creada
    return NextResponse.json({
      message: "Autorización creada con éxito",
      authorization: newAuthorization,
    });
  } catch (error) {
    console.error("Error al crear autorización:", error);
    return NextResponse.json(
      { message: "Error al crear la autorización", error: error.message },
      { status: 500 }
    );
  }
}
