const params = new URLSearchParams(window.location.search);
void import(params.has('world') || params.get('builder') === '1' ? './world-app' : './launcher');
