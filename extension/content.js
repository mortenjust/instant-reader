console.log("content script. Do we have readability: ", Readability)
var showingArticle = false
var currentBrightness = "light"

var d = document
var dCopy = d.cloneNode(true)

var loc = d.location;
var uri = {
  spec: loc.href,
  host: loc.host,
  prePath: loc.protocol + "//" + loc.host,
  scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
  pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
};

var wholePage = new Readability(uri, dCopy);
var article = wholePage.parse();

// interesting stuff in article: title, byline, content (html), textContent (plain), 
// lenght (for reading time and class scoring)

console.log("article is now ", article)
console.log("wholePage is now ", wholePage)

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  if(article !== null) toggleArticleVisibility()  
})

if(article !== null){
  console.log("there was an article here")
  chrome.runtime.sendMessage({message:"enableButton"})
  buildViewWithArticle(article, wholePage)
}

function toggleArticleVisibility(){
  if(showingArticle){
    hideArticle()
  } else {
    revealArticle()
  }
}

function revealArticle(){
  var c = document.querySelector("#mj-container")
  c.style.display = "inline-block"
  showingArticle = true
}

function hideArticle(){
  var c = document.querySelector("#mj-container")

  c.style.display = "none"
  showingArticle = false
}

function buildViewWithArticle(article, wholePage){
    console.log("buildViewWithArticle")

    var containerDiv = document.createElement("div")
    var innerContainerDiv = document.createElement("div")
    var readerDiv = document.createElement("div")
    var headlineEl = document.createElement("h1")
    var logoEl = document.createElement("img")

    containerDiv.id = "mj-container"
    innerContainerDiv.id = "mj-inner-container"
    headlineEl.id = "mj-headline"
    readerDiv.id = "mj-reader"
    logoEl.id = "mj-logo"

    var domain = window.location.href.match(/:\/\/(.[^/]+)/)[1]
    logoEl.setAttribute("src", "http://logo.clearbit.com/"+domain+"?size=50")
    
    containerDiv.style.display = "none"

    // headlineEl.style.fontFamily = wholePage._getArticleTitleStyle().fontFamily
    var ws = wholePage._getArticleTitleStyle()
    var hs = headlineEl.style 

    if(ws != null){
        hs.fontFamily = ws.fontFamily
        hs.fontWeight = ws.fontWeight
        hs.fontSize = ws.fontSize
        hs.lineHeight = ws.lineHeight
    }
    
    console.log("setting this fontFamily", wholePage._getArticleTitleStyle())

    headlineEl.innerText = article.title
    readerDiv.innerHTML = article.content

    // add the computed style to the cleaned-up article
    if(article.contentStyle != null){
        console.log("articlestyle is ", article.contentStyle)
        readerDiv.style.fontFamily = article.contentStyle.fontFamily
        readerDiv.style.fontWeight = article.contentStyle.fontWeight
        // readerDiv.style.fontSize = "32dp" // article.contentStyle.fontSize
        readerDiv.style.lineHeight = article.contentStyle.lineHeight
    }

    containerDiv.appendChild(generateToolbarDiv())
    
    innerContainerDiv.appendChild(logoEl)
    innerContainerDiv.appendChild(headlineEl)
    innerContainerDiv.appendChild(readerDiv)
        
    containerDiv.appendChild(innerContainerDiv)

    var body = document.querySelector("body")
    // body.appendChild(containerDiv)
    body.insertBefore(containerDiv, body.firstChild)

    window.scroll(0,0)
}

function generateToolbarDiv(){
  var toolbarDiv = document.createElement("div")
  toolbarDiv.id = "mj-toolbar"
  
  var brightnessDiv = document.createElement("img")
  var c = chrome.extension.getURL("images/brightness.svg")
  brightnessDiv.setAttribute("src", c)
  brightnessDiv.addEventListener("click", toggleBrightness, false)
  
  var smallerDiv = document.createElement("img")
  smallerDiv.setAttribute("src", chrome.extension.getURL("images/smaller.svg"))
  smallerDiv.addEventListener("click", smallerText, false)

  var biggerDiv = document.createElement("img")
  biggerDiv.setAttribute("src", chrome.extension.getURL("images/bigger.svg"))
  biggerDiv.addEventListener("click", biggerText, false)
  
  toolbarDiv.appendChild(brightnessDiv)
  toolbarDiv.appendChild(smallerDiv)   
  toolbarDiv.appendChild(biggerDiv)   

  return toolbarDiv
}

var font = {
  bigger: "bigger",
  smaller: "smaller"
} 

function biggerText(){
  console.log("biggertext")
  changeTextSize(font.bigger)
}

function smallerText(){
  console.log("biggertext")
  changeTextSize(font.smaller)
}

function changeTextSize(action){
  var c = document.querySelector("#mj-reader")
  var curSize = parseFloat(window.getComputedStyle(c).fontSize)  
  
  c.style.lineHeight = "150%"
  switch (action) {
    case font.bigger:
        c.style.fontSize = (curSize + 1) + "px"
      break;

    case font.smaller:
     c.style.fontSize = (curSize - 1) + "px"
      break

    default:
      break;
  }
}

function applyDarkTheme(){
  var c = document.querySelector("#mj-container")
  c.classList.add("mj-dark")  
  c.classList.remove("mj-light")
  currentBrightness = "dark"
}

function applyLightTheme(){
  var c = document.querySelector("#mj-container")
  c.classList.add("mj-light")  
  c.classList.remove("mj-dark")
  currentBrightness = "light"
}

function toggleBrightness(){
  console.log("toggle brightness")
  switch (currentBrightness) {
    case "light":
        applyDarkTheme()
      break;    
    case "dark":
        applyLightTheme()
      break;  

    default:
      break;
  }
  
}