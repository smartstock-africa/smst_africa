from django_hosts import patterns, host

host_patterns = patterns('',
        host(r'smst', 'router.urls', name='smst'),
        host(r'user', 'router.account.urls', name="account")
    )