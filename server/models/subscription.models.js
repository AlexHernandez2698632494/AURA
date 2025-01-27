import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    subject: {
      entities: [{ idPattern: String, type: String }],
      condition: {
        attrs: [{ type: String }]
      }
    },
    notification: {
      http: { url: { type: String, required: true } },
      attrs: [{ type: String }]
    },
    metadata: [{ type: String }],
    estadoEliminacion: { type: Number, default: 0 } // Campo para eliminación lógica
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
