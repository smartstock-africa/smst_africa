from django.http import HttpResponseRedirect
def smst_logged_in(func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return func(request, *args, **kwargs)
        return HttpResponseRedirect('https://user.smartstock.africa/')
    return wrapper