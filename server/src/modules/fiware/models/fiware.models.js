import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const fiwareSchema = new mongoose.Schema({
    fiware_service:{type:String,require:true},
    fiware_servicepath:{type:String,require:true},
})

const Fiware = connectDB.model("fiware",fiwareSchema)

export default Fiware