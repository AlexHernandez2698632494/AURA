import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const alertSchema = new mongoose.Schema({
    variable: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    initialRange: {
        type: Number,
        required: true,
    },
    finalRange: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    enabled: {
        type: Boolean,
        required: true,default:true
    },
    estadoEliminacion: {type:Number, default:0},
}, { timestamps: true });

const Alert = connectDB.model("Alert", alertSchema);

export default Alert;