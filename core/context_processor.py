def smst_pro_logo(request):
    user= request.user
    if user.is_authenticated and user.has_active_subscription:
        return {
            'pro_user':'active',
            'smst_logo': 'https://res.cloudinary.com/di3bh4qsl/image/upload/v1791388671/smst_pro_logo_fobkyu.png',
        }
    return {
        'pro_user':'inactive',
        'smst_logo': 'https://res.cloudinary.com/di3bh4qsl/image/upload/v1780517418/latest_smst_logo_1_vrlvwa.png'
    }
        