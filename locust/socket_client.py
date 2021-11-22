import json
import time

import gevent
import websocket
from locust import events
from websocket import WebSocketConnectionClosedException


class SocketClient(object):
    def __init__(self, host):
        self.host = host
        self.ws = websocket.WebSocket()
        self.connect()

        events.quitting.add_listener(lambda environment: self.on_close())

    def connect(self):
        self.ws.settimeout(10)
        self.ws.connect(self.host)

    def send_with_response(self, payload):
        json_data = json.dumps(payload)

        g = gevent.spawn(self.ws.send, json_data)
        g.get(block=True, timeout=2)
        g = gevent.spawn(self.ws.recv)
        result = g.get(block=True, timeout=10)

        json_data = json.loads(result)
        return json_data

    def on_close(self):
        self.ws.close()

    def send(self, payload):
        start_time = time.time()
        try:
            data = self.send_with_response(payload)
            elapsed = int((time.time() - start_time) * 1000)
            events.request_success.fire(request_type='WS', name='send',
                                        response_time=elapsed,
                                        response_length=len(str(data)))
            return data
        except Exception as exp:
            elapsed = int((time.time() - start_time) * 1000)
            events.request_failure.fire(request_type='WS', name='send',
                                        response_time=elapsed, exception=exp,
                                        response_length=0)
            self.ws.close()
            self.connect()

