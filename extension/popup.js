console.log("popup.js launched")

document.addEventListener('DOMContentLoaded', function () {
  console.log("ready to execute")
  console.log("sending message")

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
      console.log(response);
    });
  });

 window.close()

});