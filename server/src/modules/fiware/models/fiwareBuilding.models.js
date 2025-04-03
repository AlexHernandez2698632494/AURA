import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const fiwareBuildingSchema = new mongoose.Schema({
    fiware_service:{type:String,require:true},
    fiware_servicepath:{type:String,require:true},
})

const FiwareBuilding = connectDB.model("fiwareBuilding",fiwareBuildingSchema)

export default FiwareBuilding