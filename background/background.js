chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if(request.method === "getOptions") {
            sendResponse(localStorage);
        } else {
         //   sendResponse({});
        }
});

