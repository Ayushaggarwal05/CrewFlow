from rest_framework.renderers import JSONRenderer

class CustomRenderer(JSONRenderer):
    def render(self , data, accepted_media_type=None , renderer_context=None):
        response = renderer_context.get("response" , None)

        if response is None:
            return super().render(data ,accepted_media_type,renderer_context  )
        status = response.status_code

        if status >= 200 and status < 300:
            result = {
                "success" : True,
                "message" : "",
                "data" : data,
            }
        
        else:
            result = {
                "success" : False,
                "message" : data,
                "data" : None,
            }
        
        return super().render(result , accepted_media_type,renderer_context)