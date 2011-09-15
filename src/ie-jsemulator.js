/*
 * sites to examine: http://triad.mlxtempo.com/ 
 *                  http://proptx.midland.com.hk/unit/%AC%C4%C4R%C6W-%B2%C4%A4%40%B4%C1%A1B%B2%C4%A4G%B4%C1-park-island-phase-1-and-2
 *                  http://www.roblox.com/Default3.aspx
 *                  MSDN
 *                  http://www.mlxchange.com/
 *
 *                  IDEAS:
 *                  http://toastytech.com/good/badsitelistframe.html
 *          
 *
 * User agents: http://www.useragentstring.com/pages/Internet%20Explorer/
 *
 * TODO: implement a SVG ActiveXObject
 *
 * TODO: Fix: Uncaught TypeError: Object #<Document> has no method 'selectNodes'
 * TODO: Fix: Uncaught TypeError: Object [object Object] has no method 'loadXML'
 *
 */


(function() {
/*
 * Config:
 */
if(!window.IEEmulatorOptions) {
    IEEmulatorOptions = {};
    IEEmulatorOptions['emulatorEnabled'] = true;
    IEEmulatorOptions['enableRemoveChild'] = true;
    IEEmulatorOptions['browserSpoofing'] = true;
    IEEmulatorOptions['logConsole'] = true;
    IEEmulatorOptions['userAgent'] = "Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))";
}


// Spoof the UserAgent:
if(IEEmulatorOptions['browserSpoofing']) {
    (function() {
        var spoofUserAgent = function(newUserAgentString) {
            oldUserAgent = navigator.userAgent;
            navigator.__defineGetter__("userAgent", function() {
                    if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: navigator.userAgent getter called."); }
                    return newUserAgentString;
                    });
            navigator.__defineGetter__("vendor", function() {
                    if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: navigator.vendor getter called."); }
                    return "";
                    });
        };
        spoofUserAgent(IEEmulatorOptions['userAgent']);
        
    })();
}

// Define the JSON object if it isn't:
if(!JSON) {
    JSON = {};
}

window.frames = function() {
    var allFrames = document.getElementsByTagName("frame");
    debugger;
    for(var i = 0; i < allFrames.length; i++) {
        if(allFrames[i].name === arguments[0]) {
            return allFrames[i];
        }
    }
};
 

// Just point the IE ActiveXObject at window.XMLHttpRequest for the momment
// TODO: maybe only define certain things depending on the type of activexobject (xml, xmlhttp, etc.)
window.ActiveXObject = function() {
    if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: ActiveXObject created."); }
    var requestObject = new window.XMLHttpRequest();
    var __onreadystatechange;

    this.open = function() {
        return requestObject.open.apply(requestObject, arguments);
    };
    this.send = function() {
        return requestObject.send.apply(requestObject, arguments);
    };
    this.__defineGetter__("onreadystatechange", function() {
            return requestObject.onreadystatechange;
    });
    this.__defineSetter__("onreadystatechange", function() {
            requestObject.onreadystatechange = arguments[0];
    });
    this.__defineGetter__("readyState", function() {
            return requestObject.readyState;
    });
    this.__defineGetter__("responseXML", function() {
        var xmlDoc = requestObject.responseXML;
        if(xmlDoc !== null) {
            xmlDoc.selectNodes = function() {
                //var nsResolver = xmlDoc.createNSResolver( xmlDoc.ownerDocument == null ? xmlDoc.documentElement : xmlDoc.ownerDocument.documentElement);
                var xpath = xmlDoc.evaluate(arguments[0], xmlDoc, null, XPathResult.ANY_TYPE, null);
                xpath.length = xmlDoc.evaluate('count('+arguments[0]+')', xmlDoc, null, XPathResult.ANY_TYPE, null).numberValue;
                return xpath;
            };
        }
        return xmlDoc;
    });
    this.__defineGetter__("responseText", function() {
            return requestObject.responseText;
    });
    this.__defineGetter__("responseXML", function() {
            return requestObject.responseXML;
    });
    this.__defineGetter__("responseType", function() {
            return requestObject.responseType;
    });

    var oldSetRequestHeader = requestObject.setRequestHeader;
    this.setRequestHeader = function() {
        if(arguments.length === 2) {
            return oldSetRequestHeader.apply(requestObject, [arguments.join(':')]);
        }
        else if(arguments.length === 1) {
            return oldSetRequestHeader.apply(requestObject, arguments);
        }
    };

    this.load = function() { // load a file synchonously
        requestObject.open("GET", arguments[0], false);
        return requestObject.send();
    };


    /* Does a XSL transformation and then returns the result as a string.
     */
    this.transformNode = function() {
        var toTransform = requestObject.responseXML.documentElement;
        var styleSheet = arguments[0].responseXML.documentElement;

        // Quick fix for unsupported namespaces:
        styleSheet.setAttribute("xmlns:xsl", "http://www.w3.org/1999/XSL/Transform");

        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(styleSheet);

        // Create a temporary div and append the results of the transformation to it, and then return its innerHTML (string)
        var tmp = document.createElement("div");
        var newElements = xsltProcessor.transformToDocument(toTransform).documentElement.childNodes[0].childNodes;
        for(var i = 0; i < newElements.length; i++) {
            tmp.appendChild(newElements[i]);
        }
        return tmp.innerHTML.replace(/parsererror/g, "p");
    };


};

window.createPopup = function() {
    var popupDiv = document.createElement("div");
    var isOpen = false;
    var myX, myY, myWidth, myHeight, myParent;
    
    popupDiv.document = new Object();
    popupDiv.document.body = popupDiv;


    popupDiv.__defineGetter__("isOpen", function() {
            return isOpen;
    });

    // Check if a point is in the popup:
    var pointInPopup = function(x, y) {
        return (x >= myX && x <= myX+myWidth && y >= myY && y <= myY+myHeight);
    };

    var pageClick = function(e) {
        if(!pointInPopup(e.clientX, e.clientY)) {
            popupDiv.hide();
        }
    };
    
    popupDiv.show = function(x, y, width, height, parent) {
        if(!isOpen) {
            myX = x; myY = y; myWidth = width; myHeight = height; myParent = parent;
            this.style.left = x;
            this.style.top = y;
            this.style.width = width;
            this.style.height = height;

            document.addEventListener('mousedown', pageClick, true);

            parent.appendChild(this);
            isOpen = true;
        }
    };

    popupDiv.hide = function() {
        if(isOpen) {
            myParent.removeChild(popupDiv);
            document.removeEventListener('mousedown', pageClick, true);
            isOpen = false;
        }
    };

 
    popupDiv.style.width = "200px";
    popupDiv.style.height = "200px";
    popupDiv.style.position = 'absolute';
    popupDiv.style.background = "yellow";
    
    return popupDiv;
};

    


/* HTMLElement
 */

HTMLElement.prototype.__defineGetter__("canHaveChildren", function() {
    var noChildren = ['BR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'BASE', 'FRAME', 'HR', 'COL', 'ISINDEX'];
    return noChildren.indexOf(this.tagName) === -1;
});

//HTMLElement.prototype.__defineGetter__("all", function() {
document.__defineGetter__("all", function() {
    var all = this.getElementsByTagName("*");
    all.tags = this.getElementsByTagName;
    return all;
});

HTMLElement.prototype.__defineGetter__("currentStyle", function() {
    return this.ownerDocument.defaultView.getComputedStyle(this, null);
});

/* Events
 */

// Helper function:
var pointInBox = function(x, y, boxX, boxY, boxWidth, boxHeight) {
    return (x >= boxX && x <= boxX+boxWidth && y >= boxY && y <= boxY+boxHeight);
};

Element.prototype.__defineSetter__("onmouseenter", function() {
    var overElement = false;
    var func = arguments[0];
    var t = this;

    // Override the default getter to return the callback function
    this.__defineGetter__("onmouseenter", function() {
        return func;
    });

    this.addEventListener("mouseover", function(e) {
        if(!overElement) {
            overElement = true;
            func.apply(t, [e]);
        }
    }, true);

    this.addEventListener("mouseout", function(e) {
        if(!pointInBox(e.clientX, e.clientY, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight)) {
            overElement = false;
        }
    }, true);

});

Element.prototype.__defineGetter__("onmouseenter", function() {
    return null;
});


Element.prototype.__defineSetter__("onmouseleave", function() {
    var overElement = false;
    var func = arguments[0];
    var t = this;
    
    // Override the default getter to return the callback function
    this.__defineGetter__("onmouseleave", function() {
        return func;
    });

    this.addEventListener("mouseout", function(e) {
        if(!pointInBox(e.clientX, e.clientY, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight)) {
            overElement = false;
            func.apply(t, [e]);
        }
    }, true);

});

Element.prototype.__defineGetter__("onmouseleave", function() {
    return null;
});


/* From MDN: Call this method during the handling of a mousedown event to retarget all mouse events to
 * this element until the mouse button is released or document.releaseCapture()  is called.
 * https://developer.mozilla.org/en/DOM/element.setCapture
 *
 * TODO: use e.preventDefault() to prevent links from turning into icons and then being dragged,
 *      which conflicts with these functions.
 *      https://developer.mozilla.org/en/DOM/event.preventDefault
 *
 * implementation idea from: gimme.events.js, http://gimme.codeplex.com/SourceControl/changeset/view/60713#761723
 */
(function() {
    
    captureEnabled = false;

    asdf = this;


    this.captureListener = null;
    

    Element.prototype.setCapture = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: setCapture() called."); }


        capturingElement = this;
        
        captureListener = function(e) {
            e.preventDefault();
            console.log('rerouting');
            var scrollPos;

            if(e.type === "mouseup") { // if it was released, remove all listeners
                capturingElement.releaseCapture();
                return;
            }
                
        
            document.removeEventListener(e.type, captureListener, true);
            e.captureTarget = e.target;
            capturingElement.dispatchEvent(e);
            if (captureListener !== null) {
                document.addEventListener(e.type, captureListener, true);
            }
            delete e.captureTarget;
        
            e.stopPropagation();
        };
    
        console.log('started capture');
        captureEnabled  = true;
    
        document.addEventListener('mouseover', captureListener, true);
        document.addEventListener('mouseout', captureListener, true);
        document.addEventListener('mousemove', captureListener, true);
        document.addEventListener('mouseup', captureListener, true);
        document.addEventListener('mousedown', captureListener, true);
        document.addEventListener('click', captureListener, true);

    
    };
    
    Element.prototype.releaseCapture = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: releaseCapture() called."); }
        if(captureEnabled) {
            console.log('release capture');
            document.removeEventListener('mouseover', captureListener, true);
            document.removeEventListener('mouseout', captureListener, true);
            document.removeEventListener('mousemove', captureListener, true);
            document.removeEventListener('mouseup', captureListener, true);
            document.removeEventListener('mousedown', captureListener, true);
            document.removeEventListener('click', captureListener, true);
            document.removeEventListener('dblclick', captureListener, true);
            captureEnabled = false;
        }
    
    };
})();


/*
 *
 * Some of the following lines are Gecko specific, and are probably not needed for IE
 *
 */

/*  Node
 */

Node.prototype.removeNode = function() {
    if(arguments[0]) { // if we're supposed to remove the node and its children
        return this.parentNode.removeChild(this);
    } else { // or else, replace this node by its children
        var children = document.createRange();
        children.selectNodeContents(this);
        return this.parentNode.replaceChild(children.extractContents(), this);
    }
};

Node.prototype.replaceNode = function() {
    this.parentNode.replaceChild(arguments[0], this);
};

Node.prototype.swapNode = function() {
    var node1 = this;
    var node2 = arguments[0];

    var temp = node1.cloneNode(true);

    var parent1 = node1.parentNode;
    var parent2 = node2.parentNode;

    node2 = parent2.replaceChild(temp, node2);
    parent1.replaceChild(node2, node1);
    parent2.replaceChild(node1, temp);

    temp = null;
};


/*
 * Gecko specific functions/implementation for style sheet handling.
 *
 */
(function() {
    
    // Some local variables to keep track of the StyleSheets:
    var sheetsInitialized = false;  // true if selectedStyleSheetSet has been assigned
    var currentlySelectedStyleSheetSet = null;
    var lastSelectedStyleSheetSet = null;

    /*
     * From MDN:
     * Enables the style sheets matching the specified name in the current style sheet set, and disables all other style sheets (except those without a title, which are always enabled).
     *
     * Source: http://www.alistapart.com/articles/alternate/
     *
     * @param name Name of the stylesheets to enable.
     */
    document.enableStyleSheetsForSet = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: enableStyleSheetsForSet() called."); }
        var oldLastStyleSheet = lastSelectedStyleSheetSet;
        document.selectedStyleSheetSet = arguments[0];
        lastSelectedStyleSheetSet = oldLastStyleSheet; // this function should not affect the value of the last sheet
    };

    document.__defineGetter__("styleSheetSets", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: styleSheetSets gettter called."); }
        var sheets = [];
        for(i = 0; (l = document.getElementsByTagName("link")[i]); i++) {
            if(l.getAttribute("rel").indexOf("style") != -1 && l.getAttribute("title")) {
                sheets.push(l.getAttribute("title"));
            }
        }
        return sheets;
    });
    
    document.__defineSetter__("selectedStyleSheetSet", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: selectedStyleSheetSet setter called."); }
        sheetsInitialized = true; 
        var name = arguments[0];
        lastSelectedStyleSheetSet = name; // same behavior as Gecko: last==current sheet
        var i, l, main;
        for(i = 0; (l = document.getElementsByTagName("link")[i]); i++) {
            if(l.getAttribute("rel").indexOf("style") !== -1 && l.getAttribute("title")) {
                l.disabled = true;
                if(l.getAttribute("title") === name) {
                    l.disabled = false;
                    currentlySelectedStyleSheetSet = name;
                }
            }
        }
        //return (currentlySelectedStyleSheetSet = arguments[0]);
    
    });
    
    document.__defineGetter__("selectedStyleSheetSet", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: selectedStyleSheetSet getter called."); }
        if(!sheetsInitialized) { // if no sheet has been selected yet
            return document.preferredStylesheetSet;
        }
        return currentlySelectedStyleSheetSet;
    });
    
    document.__defineGetter__("lastStyleSheetSet", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: lastStyleSheetSet getter called."); }
        return lastSelectedStyleSheetSet;
    });

    document.__defineGetter__("preferredStyleSheetSet", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: preferredStyleSheetSet getter called."); }
        return document.preferredStylesheetSet;
    });
})();

/*
 * CSS selector incompatabilities
 */

(function() {

    /* Returns some text from a URL.
     * 
     * @param url The url from which to load the text.
     */
    var getURLContents = function (url){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url, false);
        xmlhttp.send();
        return xmlhttp.responseText;
    };

    /* Returns a string of all the CSS it can find in <link> and <style> elements.
     */
    var getRawCSS = function() {
        var styleString = '';
        var i, s, l;

        // Get everything from <style> elements:
        for(i = 0; (s = document.getElementsByTagName("style")[i]); i++) {
                styleString += s.innerHTML;
        }
        
        // Geteverything from <link> elements:
        for(i = 0; (l = document.getElementsByTagName("link")[i]); i++) {
            if(l.getAttribute("rel").indexOf("style") !== -1) {
                // Get contents of the external sheets:
                styleString += getURLContents(l.href);
            }
        }

        return styleString;
    };

    /* Return an array of CSS selectors that have the provided property-value pair.
     *
     * return format: [[selector, property, value]]
     *
     * @param property A string or array containing the name(s) of the property(s).
     * @param value A string or array containing the value(s) to look for in properties.
     */
    var findCSSPropertySelector = function(property, value) {
        // if the arguments are arrays, turn them into the proper regex syntax
        var propertyString = property;
        if(property.constructor === Array) {
            propertyString = property.join('|');
        }
        var valueString = value;
        if(value.constructor === Array) {
            valueString = value.join('|');
        }

        var CSSRuleRegex = new RegExp('([^}]*)[\\s\\n]*{[^}]*(' + propertyString + ')[^:]*:([^;]*' + valueString + '[^;]*);[^}]*}');
        var rawCSS = getRawCSS();
        var matches = rawCSS.match(CSSRuleRegex);
        if(matches.length > 3) {
            for(var i = 0; i < matches.length; i++) {
                matches[i] = matches[i].trim();
            }
            return matches.splice(1);
        }

        return null;

    };


    document.mozSetImageElement = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: mozSetImageElement() called."); }
        var imageElementId = arguments[0];
        var imageElement = arguments[1];
    
        // Add the new CSS for webkit background images.
        // Start by figuring out where the Gecko-speific one is,
        var elementRule = findCSSPropertySelector('background', '-moz-element\\(#' + imageElementId + '\\)');
        // and then adding the equivalent webkit rule
        var matchingElements = document.querySelectorAll(elementRule[0]);
        for(var i = 0; i < matchingElements.length; i++) {
            matchingElements[i].style.setProperty(elementRule[1], "-webkit-canvas(" + imageElementId + ")");
        }
    
        var fromCtx;
        if(imageElement.nodeName === "IMG") { // turn it into a canvas
            var newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("width", imageElement.width);
            newCanvas.setAttribute("height", imageElement.height);
            fromCtx = newCanvas.getContext("2d");
            fromCtx.drawImage(imageElement, 0, 0);
        }
        else if(imageElement.nodeName === "CANVAS") {
            fromCtx = imageElement.getContext("2d");
        }
    
        var toCtx = document.getCSSCanvasContext("2d", imageElementId, imageElement.width, imageElement.height);
        toCtx.putImageData(fromCtx.getImageData(0, 0, fromCtx.canvas.width, fromCtx.canvas.height), 0, 0);
    
    };
})();
    


/* UserData
 *
 */
(function() {
    // Some local variables to store the userdata, and metadata for this implementation
    var userDataObjectsKeys = {}; // format: {object_key: object_reference}
    var userDataObjects = {}; // format: {object_key: {data_key: {data: data1, handle: function()}}, }
    
    /*
     * setUserData()
     */
    Element.prototype.setUserData = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: setUserData() called."); }
        var thisObjectKey = '';
        var previousData = null;
        for(var key in userDataObjectsKeys) { // try to find the object (and its key) if it's already got data associated with it
            if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
            if(userDataObjectsKeys[key] === this) {
                thisObjectKey = key;
                if(userDataObjects[thisObjectKey].hasOwnProperty(arguments[0])) { // if there is previous data, save it
                    previousData = userDataObjects[thisObjectKey][arguments[0]].data;
                }
                break;
            }
        }
        if(thisObjectKey.length === 0) { // if it couldn't be found, create a random ID, and put it in
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i=0; i < 16; i++ ) {
                thisObjectKey += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            userDataObjectsKeys[thisObjectKey] = this;
        }
    
        userDataObjects[thisObjectKey] = {};
        userDataObjects[thisObjectKey][arguments[0]] = {'data': arguments[1], 'callback': arguments[2]};
        return previousData;
    
    };
    
    /*
     * getUserData()
     */
    Element.prototype.getUserData = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: getUserData() called."); }
        var thisObjectKey = null;
        for(var key in userDataObjectsKeys) {
            if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
            if(userDataObjectsKeys[key] === this) {
                thisObjectKey = key;
                break;
            }
        }
    
        if(thisObjectKey !== null) {
            return userDataObjects[thisObjectKey][arguments[0]].data;
        }
        return null; // if nothing was found
    };

    /*
     * Need to override the following functions in order to ensure the callback
     * that is set by setUserData is called for its associated node.
     */

    var oldImportNode = document.importNode;
    document.importNode = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: importNode() called."); }
        var newNode = oldImportNode.apply(this, arguments);
        for(var key in userDataObjectsKeys) {
            if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
            if(arguments[0] === userDataObjectsKeys[key]) {
                for(var dataKey in userDataObjects[key]) {
                    if(!userDataObjects[key].hasOwnProperty(dataKey)) { continue; }
                    userDataObjects[key][dataKey].callback.handle(2, dataKey, userDataObjects[key][dataKey].data, arguments[0], newNode);
                }
                break;
            }
        }
        return newNode;
    };
    
    var oldCloneNode = Node.prototype.cloneNode;
    Node.prototype.cloneNode = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: cloneNode() called."); }
        var newNode = oldCloneNode.apply(this, arguments);
        for(var key in userDataObjectsKeys) {
            if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
            if(this === userDataObjectsKeys[key]) {
                for(var dataKey in userDataObjects[key]) {
                    if(!userDataObjects[key].hasOwnProperty(dataKey)) { continue; }
                    userDataObjects[key][dataKey].callback.handle(1, dataKey, userDataObjects[key][dataKey].data, this, newNode);
                }
                break;
            }
        }
        return newNode;
    };

    
    var oldRemoveChild = Node.prototype.removeChild;
    if(IEEmulatorOptions['enableRemoveChild']) {
        Node.prototype.removeChild = function() {
            if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: removeChild() called."); }
            var newNode = oldRemoveChild.apply(this, arguments);
            for(var key in userDataObjectsKeys) {
                if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
                if(arguments[0] === userDataObjectsKeys[key]) {
                    for(var dataKey in userDataObjects[key]) {
                        if(!userDataObjects[key].hasOwnProperty(dataKey)) { continue; }
                        userDataObjects[key][dataKey].callback.handle(3, dataKey, userDataObjects[key][dataKey].data, arguments[0], newNode);
                    }
                    break;
                }
            }
            return newNode;
        };
    }
    
    var oldAdoptNode = document.adoptNode;
    document.adoptNode = function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: adoptNode() called."); }
        var newNode = oldAdoptNode.apply(this, arguments);
        for(var key in userDataObjectsKeys) {
            if(!userDataObjectsKeys.hasOwnProperty(key)) { continue; }
            if(arguments[0] === userDataObjectsKeys[key]) {
                for(var dataKey in userDataObjects[key]) {
                    if(!userDataObjects[key].hasOwnProperty(dataKey)) { continue; }
                    userDataObjects[key][dataKey].callback.handle(5, dataKey, userDataObjects[key][dataKey].data, arguments[0], newNode);
                }
                break;
            }
        }
        return newNode;
    };
 })();


/*
 * Applies a function to every element in an array.
 *
 * @param input An array.
 * @param function The function to apply to every element in the array.
 */
Array.filter = function() {
    if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: Array.filter() called."); }
    result = [];
    for(var item = 0; item < arguments[0].length; item++) {
        if(arguments[1].apply(this, [arguments[0][item]])) {
            result.push(arguments[0][item]);
        }
    }
    return result;
};


/*
 * Allow String.replace() to be called alone, not via prototype.
 * Can also take an array argument instead of a string. The replace operation is applied
 * to every element in the array.
 *
 * @param input A string or an array.
 * @param match The string to match.
 * @param replace The string to replace with.
 */
String.replace = function() {
    if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: String.replace() called."); }
    if(arguments[0].constructor === Array) {
        var result = [];
        for(var i = 0; i < arguments[0].length; i++) {
            result.push(arguments[0][i].replace(arguments[1], arguments[2]));
        }
        return result.join(',');
    } else {
        return arguments[0].replace(arguments[1], arguments[2]);
    }
};

/*
 * TODO: findout if the content type can be something other than text/html
 */
document.__defineGetter__("contentType", function() {
        if(IEEmulatorOptions['logConsole']) { console.log("IEEmulator: contentType getter called."); }
        return "text/html";

});


if(IEEmulatorOptions['logConsole']) {
    console.log('IE JS Emulator loaded.');
}


})();
