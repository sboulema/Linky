var settings;

async function getSettings() {
    settings = await $.getJSON("settings.json");
}

async function getVersion() {
    await getSettings();
    return settings.version;
}

/* Check if update is needed
 * True: update needed
 * False: already running latest version
 */
async function checkVersion() {
    var currentVersion = settings.version;
    var latestVersion = await getVersion();

    if (currentVersion !== latestVersion) {
        $('#versionReloadToast').toast({ autohide: false })
        $('#versionReloadToast').toast('show');
        return true;
    }

    return false;
}