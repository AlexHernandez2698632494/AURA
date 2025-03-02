import mongoose from "mongoose";
import { connectFiwareDB } from "../../../../config/db.js";

const deviceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  protocol: {
    type: String,
    required: true,
  },
  transport: {
    type: String,
    required: true,
  },
  apikey: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
  attributes: {
    type: Array,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  subservice: {
    type: String,
    required: true,
  },
});

export default connectFiwareDB.model("Device", deviceSchema);
