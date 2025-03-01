import mongoose from 'mongoose';


const serviceSchema = new mongoose.Schema({
    apikey: {
        type: String,
        required: true,
    },
    cbroker: {
        type: String,
        required: true,
    },entity_type: {
        type: String,
        required: true,
    },resource: {
        type: String,
        required: true,
    },service: {
        type: String,
        required: true,
    },subservice: {
        type: String,
        required: true,
    }
}
// ,{collection: 'group'}
);
    export default mongoose.model('Service', serviceSchema);