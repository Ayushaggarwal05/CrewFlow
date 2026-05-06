from rest_framework.renderers import JSONRenderer

class CustomRenderer(JSONRenderer):
    def render(self , data, accepted_media_type=None , renderer_context=None):
        response = renderer_context.get("response" , None)

        if response is None:
            return super().render(data ,accepted_media_type,renderer_context  )
        status = response.status_code

        if status >= 200 and status < 300:
            if isinstance(data, str):
                result = {
                    "success": True,
                    "message": data,
                    "data": None,
                }
            else:
                result = {
                    "success": True,
                    "message": "",
                    "data": data,
                }
        else:
            # Errors (data is already a string from custom_exception_handler or direct Response)
            result = {
                "success": False,
                "message": data if isinstance(data, str) else str(data),
                "data": None,
            }
        
        return super().render(result , accepted_media_type,renderer_context)