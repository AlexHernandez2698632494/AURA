from dash import html, dcc
import dash_bootstrap_components as dbc

def layout():
    return dbc.Container([
        html.H1("Dashboard Cliente MQTT", className="my-4"),

        # Intervalo para actualizar mensajes recibidos
        dcc.Interval(id='message-interval', interval=1000, n_intervals=0),

        # Conexión al Broker
        dbc.Card([
            dbc.CardHeader("Conexión al Broker"),
            dbc.CardBody([
                dbc.Input(id='host', placeholder='Host del broker', type='text', className="mb-2"),
                dbc.Input(id='port', placeholder='Puerto', type='text', className="mb-2"),
                dbc.Button("Conectar", id='connect-btn', n_clicks=0, color="primary"),
                html.Div(id='connection-status', className="mt-2")
            ])
        ], className="mb-4"),

        # Suscripciones
        dbc.Card([
            dbc.CardHeader("Suscripciones"),
            dbc.CardBody([
                dbc.Input(id='sub-topic', placeholder='Topic a suscribirse', type='text', className="mb-2"),
                dbc.Button("Suscribirse", id='sub-btn', n_clicks=0, color="success"),
                html.H5("Suscripciones activas:", className="mt-3"),
                html.Ul(id='active-subs')
            ])
        ], className="mb-4"),

        # Publicaciones
        dbc.Card([
            dbc.CardHeader("Mensajes Guardados para Publicar"),
            dbc.CardBody([
                dbc.Input(id='pub-topic', placeholder='Topic', type='text', className="mb-2"),
                dbc.Input(id='pub-message', placeholder='Mensaje', type='text', className="mb-2"),
                dbc.Button("Guardar", id='save-btn', n_clicks=0, color="info"),
                html.Div(id='save-status', className="mt-2"),
                html.H5("Mensajes guardados:", className="mt-3"),
                html.Div(id='saved-messages')
            ])
        ], className="mb-4"),

        # Mensajes Recibidos
        dbc.Card([
            dbc.CardHeader("Mensajes Recibidos"),
            dbc.CardBody([
                html.Ul(id='received-messages')
            ])
        ])
    ], fluid=True)
