from dash import Dash, Input, Output, State, html, ctx, ALL
import dash_bootstrap_components as dbc
from layout import layout
from mqtt_client import mqtt_client

app = Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "MQTT Dashboard"
app.layout = layout()

# Lista de publicaciones guardadas
saved_messages = []

# Conexión al broker
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

# Suscribirse a topic
@app.callback(
    Output('active-subs', 'children'),
    Input('sub-btn', 'n_clicks'),
    State('sub-topic', 'value'),
    prevent_initial_call=True
)
def subscribe(n_clicks, topic):
    mqtt_client.subscribe(topic)
    return [html.Li(t) for t in sorted(mqtt_client.subscriptions)]

# ✅ Callback único para guardar / enviar / borrar mensajes
@app.callback(
    Output('saved-messages', 'children'),
    Output('save-status', 'children'),
    Input('save-btn', 'n_clicks'),
    Input({'type': 'send-button', 'index': ALL}, 'n_clicks'),
    Input({'type': 'delete-button', 'index': ALL}, 'n_clicks'),
    State('pub-topic', 'value'),
    State('pub-message', 'value'),
    prevent_initial_call=True
)
def handle_messages(save_click, send_clicks, delete_clicks, topic, message):
    triggered_id = ctx.triggered_id

    if isinstance(triggered_id, dict):
        idx = triggered_id.get("index")
        if triggered_id["type"] == "send-button" and send_clicks[idx]:
            mqtt_client.publish(saved_messages[idx]["topic"], saved_messages[idx]["message"])
        elif triggered_id["type"] == "delete-button" and delete_clicks[idx]:
            saved_messages.pop(idx)
            return build_saved_message_list(), ""
    elif triggered_id == "save-btn":
        if topic and message:
            saved_messages.append({"topic": topic, "message": message})
            return build_saved_message_list(), "Mensaje guardado."
        else:
            return build_saved_message_list(), "Complete los campos antes de guardar."

    return build_saved_message_list(), ""

# Mensajes recibidos
@app.callback(
    Output('received-messages', 'children'),
    Input('message-interval', 'n_intervals')
)
def update_messages(n):
    return [html.Li(f"{t}: {m}") for t, m in mqtt_client.messages_received[-10:]]

# Construcción de lista
def build_saved_message_list():
    return [
        html.Li([
            html.Span(f"{item['topic']}: {item['message']} "),
            dbc.Button("Enviar", id={'type': 'send-button', 'index': i}, color="success", size="sm", className="mx-1"),
            dbc.Button("Borrar", id={'type': 'delete-button', 'index': i}, color="danger", size="sm")
        ])
        for i, item in enumerate(saved_messages)
    ]

if __name__ == '__main__':
    app.run(debug=True)
