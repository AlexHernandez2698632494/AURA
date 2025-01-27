import Subscription from '../models/subscription.models.js';

// Crear suscripción
export const createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar suscripciones activas
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ estadoEliminacion: 0 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar suscripción
export const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar lógicamente
export const softDeleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, { estadoEliminacion: 1 });
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    res.json({ message: 'Suscripción eliminada lógicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurar suscripción
export const restoreSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, { estadoEliminacion: 0 });
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    res.json({ message: 'Suscripción restaurada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar físicamente
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    res.json({ message: 'Suscripción eliminada físicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
