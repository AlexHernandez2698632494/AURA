import Service from '../../models/iotagent/service.models.js';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

// Función para manejar la creación de servicios
export const createService = async (req, res) => {
    try {
        // Extraer los valores de los encabezados
        const { 'fiware-service': service, 'fiware-servicepath': subservice } = req.headers;

        // Extraer el cuerpo de la solicitud
        const { services } = req.body;

        // Validar que los datos necesarios estén presentes
        if (!service || !subservice || !services || services.length === 0) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        // Crear un nuevo objeto de servicio a partir de los datos
        const serviceData = new Service({
            apikey: services[0].apikey,
            cbroker: services[0].cbroker,
            entity_type: services[0].entity_type,
            resource: services[0].resource,
            service: service,
            subservice: subservice,
        });

        // Guardar el servicio en la base de datos
        await serviceData.save();

        // Responder con éxito
        res.status(201).json({ message: 'Service created successfully', data: serviceData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating service', error: error.message });
    }
};
