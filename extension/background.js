var knownTabs = [];

chrome.runtime.onInstalled.addListener(function() {

chrome.runtime.onMessage.addListener(function(s, sender, sendResponse){
	console.log("bgjs got ", s)
  if(s.message == "enableButton"){
		chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
			console.log("enabling button for tab:", tabs)
			chrome.pageAction.show(tabs[0].id)
		})
	}
})

function getPreferences(callback){
	chrome.storage.sync.get({
		maxTabs: 10,
		autoOpen: false
	}, function(items) {		
		callback(items)
	});
}
}); // oninstalled listener
