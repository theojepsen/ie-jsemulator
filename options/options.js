var toBool = function(boolstr) {
    return boolstr === 'true';
};

var removeChildren = function(parent) {
    if(parent.hasChildNodes()) {
        while(parent.childNodes.length > 0) {
            parent.removeChild(parent.firstChild);
        }
    }
};

var toggles = ['emulatorEnabled', 'browserSpoofing', 'logConsole', 'enableRemoveChild'];
var toggle_defaults = [true, true, true, true];
var toggle_names = ['Gecko emulator', 'Browser spoofing', 'Log to console', 'Enable removeChild'];

var variables = ['userAgent'];



function updateSettings() {
    var settingsTable = document.getElementById('settings');
    removeChildren(settingsTable);

    // TODO: allow userAgent to be changed:
    localStorage['userAgent'] = "Mozilla/5.0 (X11; Linux i686; rv:2.0.1) Gecko/20100101 Firefox/4.0.1";

    var toggleBox, settingName, tr, td, i;
    for(i = 0; i < toggles.length; i++) {
        if(!localStorage.hasOwnProperty(toggles[i])) {
            localStorage[toggles[i]] = toggle_defaults[i];
        }

        tr = document.createElement('tr');
        td = document.createElement('td');
        td.appendChild(document.createTextNode(toggle_names[i]));
        tr.appendChild(td);
        td = document.createElement('td');

        toggleBox = document.createElement('input');
        toggleBox.disabled = i == 0 ? false : !toBool(localStorage[toggles[0]]); // never disable first checkbox
        toggleBox.setAttribute('type', 'checkbox');
        toggleBox.checked = toBool(localStorage[toggles[i]]);
        toggleBox.id = toggles[i];
        toggleBox.addEventListener('change', function() {
            localStorage[this.id] = this.checked;
            updateSettings();
        });

        td.appendChild(toggleBox);
        tr.appendChild(td);

        settingsTable.appendChild(tr);
    }
}

updateSettings();
