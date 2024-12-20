import mongoose from "mongoose"

const authoritiesSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
})

export const Authority = mongoose.model("authority",authoritiesSchema)