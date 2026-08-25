const params = new URLSearchParams(window.location.search);
const launcherRequested = params.get('launcher') === '1';
void import(params.has('world') || params.get('builder') === '1' || !launcherRequested ? './world-app' : './launcher');
