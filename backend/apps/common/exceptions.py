from rest_framework.views import exception_handler


def custom_exception_handler(exc , context):
    response = exception_handler(exc , context)

    if response is None:
        return response
    
    message = ""

    if isinstance(response.data , dict):
        if "detail" in response.data:
            message = response.data["detail"]
        
        else:
            message = response.data

    else:
        message = response.data

    response.data = {
        "success" : False,
        "message" : message,
        "data" : None,
    }

    return response