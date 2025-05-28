from dash import Dash, Input, Output, State, html
import dash_bootstrap_components as dbc
from layout import layout
from mqtt_client import mqtt_client

app = Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "MQTT Dashboard"
app.layout = layout()

# Lista para mantener historial de publicaciones
pub_history = []

# Conectar al broker
@app.callback(
    Output('connection-status', 'children'),
    Input('connect-btn', 'n_clicks'),
    State('host', 'value'),
    State('port', 'value'),
    prevent_initial_call=True
)
def connect(n_clicks, host, port):
    if host and port:
        return mqtt_client.connect(host, port)
    return "Ingrese host y puerto válidos"

# Suscribirse a un topic
@app.callback(
    Output('active-subs', 'children'),
    Input('sub-btn', 'n_clicks'),
    State('sub-topic', 'value'),
    prevent_initial_call=True
)
def subscribe(n_clicks, topic):
    mqtt_client.subscribe(topic)
    return [html.Li(t) for t in sorted(mqtt_client.subscriptions)]

# Publicar mensaje
@app.callback(
    Output('pub-history', 'children'),
    Input('pub-btn', 'n_clicks'),
    State('pub-topic', 'value'),
    State('pub-message', 'value'),
    prevent_initial_call=True
)
def publish(n_clicks, topic, message):
    if topic and message:
        mqtt_client.publish(topic, message)
        pub_history.append(f"{topic}: {message}")
    return [html.Li(m) for m in pub_history]

# Mostrar mensajes recibidos actualizados automáticamente
@app.callback(
    Output('received-messages', 'children'),
    Input('message-interval', 'n_intervals')
)
def update_messages(n):
    return [html.Li(f"{t}: {m}") for t, m in mqtt_client.messages_received[-10:]]

if __name__ == '__main__':
    app.run(debug=True)
