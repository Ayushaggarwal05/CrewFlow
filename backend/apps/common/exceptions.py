from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    message = ""

    if isinstance(response.data, dict):
        if "detail" in response.data:
            message = response.data["detail"]
        else:
            # Format field errors (e.g., {"email": ["This field is required"]})
            error_messages = []
            for field, errors in response.data.items():
                if isinstance(errors, list):
                    error_messages.append(f"{field}: {', '.join(errors)}")
                else:
                    error_messages.append(f"{field}: {errors}")
            message = " · ".join(error_messages)
    elif isinstance(response.data, list):
        message = ", ".join(response.data)
    else:
        message = str(response.data)

    # Set response.data to the cleaned message string.
    # The CustomRenderer will then wrap this into the {success, message, data} format.
    response.data = message

    return response