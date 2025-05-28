import paho.mqtt.client as mqtt

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.connected = False
        self.messages_received = []
        self.subscriptions = set()

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def connect(self, host, port):
        try:
            self.client.connect(host, int(port), 60)
            self.client.loop_start()
            return "Conectado exitosamente"
        except Exception as e:
            return f"Error de conexión: {e}"

    def on_connect(self, client, userdata, flags, rc):
        self.connected = rc == 0

    def on_message(self, client, userdata, msg):
        self.messages_received.append((msg.topic, msg.payload.decode()))

    def subscribe(self, topic):
        if topic:
            self.client.subscribe(topic)
            self.subscriptions.add(topic)

    def unsubscribe(self, topic):
        if topic in self.subscriptions:
            self.client.unsubscribe(topic)
            self.subscriptions.discard(topic)

    def publish(self, topic, message):
        self.client.publish(topic, message)

mqtt_client = MQTTClient()
