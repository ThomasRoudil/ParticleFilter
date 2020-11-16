import json

import flask


class APIErrorCodes(object):
    INVALID_AUTHENTICATION = "invalid_authentication"
    EXPIRED_AUTHENTICATION = "expired_authentication"
    FORBIDDEN = "forbidden"
    NOT_FOUND = "not_found"
    INTERNAL_ERROR = "internal_error"


class APIError(Exception):
    def __init__(self, http_status, code, message, data=None, client_message=None):
        self.http_status = http_status
        self.code = code
        self.message = message
        self.data = data
        self.client_message = client_message or message

    def __str__(self):
        return json.dumps(self.as_dict())

    def as_dict(self):
        return {'status': self.http_status,
                'errorCode': self.code,
                'errorMessage': self.message,
                'errorData': self.data,
                'userMessage': self.client_message}

    def flask_response(self):
        return flask.Response(response=json.dumps(self.as_dict()),
                              status=self.http_status,
                              mimetype="application/json")


class BadRequest(APIError):
    def __init__(self, message, data=None, client_message=None):
        super().__init__(400, None, message, data=data, client_message=client_message)


class InvalidAuthentication(APIError):
    def __init__(self, message=None):
        super().__init__(401, APIErrorCodes.INVALID_AUTHENTICATION, message or "Invalid Authentication")


class ExpiredAuthentication(APIError):
    def __init__(self, message=None):
        super().__init__(401, APIErrorCodes.EXPIRED_AUTHENTICATION, message or "Expired authentication token")


class Forbidden(APIError):
    def __init__(self, message=None):
        super().__init__(403, APIErrorCodes.FORBIDDEN, message or "Forbidden")


class NotFound(APIError):
    def __init__(self, message=None, data=None):
        super().__init__(404, APIErrorCodes.NOT_FOUND, message or "Not found", data=data)


class InternalError(APIError):
    def __init__(self, message=None, data=None):
        super().__init__(500, APIErrorCodes.INTERNAL_ERROR, message or "Internal error", data=data)
