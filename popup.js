chrome.storage.sync.set({ "ignoredData": "myBody" }, function(){
    //  A data saved callback omg so fancy
});

chrome.storage.sync.get(/* String or Array */["ignoredData"], function(items){
    //  items = [ { "yourBody": "myBody" } ]
});