import paho.mqtt.client as mqtt
import time

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.connected = False
        self.messages_received = []
        self.subscriptions = set()

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def connect(self, host, port, username=None, password=None):
        try:
            if username and password:
                self.client.username_pw_set(username, password)

            self.client.connect(host, int(port), 60)
            self.client.loop_start()

            # Espera hasta que se actualice el estado de conexión
            for _ in range(10):  # 10 intentos x 0.2s = 2 segundos
                if self.connected:
                    break
                time.sleep(0.2)

            if self.connected:
                return "Conectado exitosamente"
            else:
                return "Fallo al conectar (¿usuario/contraseña incorrectos o el broker los requiere?)"
        except Exception as e:
            return f"Error de conexión: {e}"

    def on_connect(self, client, userdata, flags, rc):
        self.connected = rc == 0
        print(f"[on_connect] Código de retorno: {rc}, conectado: {self.connected}")

    def on_message(self, client, userdata, msg):
        mensaje = msg.payload.decode()
        print(f"[on_message] Mensaje recibido en {msg.topic}: {mensaje}")
        self.messages_received.append((msg.topic, mensaje))

    def subscribe(self, topic):
        if topic:
            self.client.subscribe(topic)
            self.subscriptions.add(topic)
            print(f"[subscribe] Suscrito a: {topic}")

    def unsubscribe(self, topic):
        if topic in self.subscriptions:
            self.client.unsubscribe(topic)
            self.subscriptions.discard(topic)

    def publish(self, topic, message):
        print(f"[publish] Publicando en {topic}: {message}")
        self.client.publish(topic, message)

mqtt_client = MQTTClient()
