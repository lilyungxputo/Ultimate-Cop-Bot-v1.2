if (typeof localStorage["data"] !== "string") localStorage["data"] = "{}"
if (typeof localStorage["params"] !== "string") localStorage["params"] = "{}"
if (typeof localStorage["keyword"] !== "string") localStorage["keyword"] = '{"0": {"category":"jackets", "keyword": "", "color": "", "size": "Small"}}'
if (localStorage['cgu'] === undefined) localStorage['cgu'] = false


var keywordData = JSON.parse(localStorage["keyword"])
var keywordID = []

var _initKeyword = _ => {
	var i = 0
	for (var key in keywordData) {
		keywordID[i] = key
		i++
	}
}

function minus(start, number) {
	if (start.toString().length !== 6)
		return 0

	var seconds = parseInt(start.toString().substr(4,2))
	if (seconds - number < 0)
		return start - number - 40
	else
		return start - number
}
const 
	_startTheBot = () => {
		// this function check is a startTime is defined and start the bot
		var startAtNewDrop = JSON.parse(localStorage["params"])["startWhenUpdated"]

		var startTime = JSON.parse(localStorage["params"])["startTime"] != undefined 
						? JSON.parse(localStorage["params"])["startTime"] 
						: '0'

		startTime = parseInt(startTime.replace(/:/g, ""))

		var waitTime = setInterval(() => {

			var nowTime = parseInt(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").replace(/:/g, ""))
			var timeCondition = startAtNewDrop
								? minus(startTime, 8) < nowTime //8 seconds before we check when drop will by updated
								: startTime < nowTime

			if (timeCondition) {

				getSupremeTabId()
					.then(tabId => {
						clearInterval(waitTime)

						keywordData = JSON.parse(localStorage["keyword"])

						_initKeyword()

						/*
						  if we are at more than 3 sec from the start time with "Automatic start when items list is updated"
						  option enabled, start the bot directly without waiting for the new drop
						*/
						if (startAtNewDrop && nowTime < startTime + 3)
							updateTab(tabId, "http://supremenewyork.com/shop/all?od", _ => {})
						else
							cop(tabId, 0)
					},
					_ => {
						clearInterval(waitTime)
						if (startTime < nowTime)
							alert("You must be on supremenewyork.com to start the bot")
						else
							alert("Bot will not start because you left supremenewyork.com")
					})

			}
		}, 500)
	},
	getSupremeTabId = () => {
		return new Promise(function(accept, reject) {

			chrome.tabs.query({}, tabs => {

					for (var tab in tabs) {

			    		if (tabs[tab].url.indexOf("supremenewyork.com") > -1) {
			    			accept(tabs[tab].id)
			    			break
			    		}
			    		else if (tab == tabs.length - 1)
			    			reject()

			    	}
			})
		})
	},
	cop = (tabId, id) => {
		//cop by item id and tab id
		tabId = parseInt(tabId)
		if (keywordData[id] != undefined) {
			var url = "http://www.supremenewyork.com/shop/all/" + keywordData[id]['category']
			updateTab(tabId, url, () => {
				//inject keyword.js to item page
				chrome.tabs.executeScript(tabId, { file: '/dist/js/keyword.js' }, function(){
					chrome.tabs.executeScript(tabId, {
					    code: 'find('+id+')'
					})
				})
			})
		}
	},
	updateTab = (tabId, url, callback) => {
		//update url of current tab
	    chrome.tabs.update(tabId, { url: url }, () => {
			chrome.tabs.onUpdated.addListener(function listenTab(tabnumber, info, tab) {
				if (tab.url.indexOf(url) > -1 && info.status == "complete") {
					chrome.tabs.onUpdated.removeListener(listenTab)
					callback()
				}
			})
		})
	};


//messange handle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.msg) {
		case 'oldItem':
			sendResponse({url: "http://supremenewyork.com/shop/all?nd", item: request.item})
			break
		case 'isEnabled':
			sendResponse({enabled: JSON.parse(localStorage['enabled'])})
			break
		case 'params':
			sendResponse(JSON.parse(localStorage["params"]))
			break
		case 'privateData':
			sendResponse(localStorage['data'])
			break
		case 'startBot':
			_startTheBot()
			break
		case 'updateRemoveImages':
			request.enabled
			? removeImages()
			: chrome.webRequest.onBeforeRequest.removeListener(listenerHandle)
			break
		case 'startCop':
			getSupremeTabId()
				.then(tabId => cop(tabId, 0))
			break
		case 'keywordsData': // @params: id => return array of keywords data from id
			sendResponse(JSON.parse(localStorage['keyword'])[request.id])
			break
		case 'cop': //handle when trying to cop item, if request.rep is here, copping is success
			var nextID = parseInt(request.id)+1,
				tabId = sender.tab.id

			if (keywordID[nextID]) //check if there are other item to cop
				cop(tabId, keywordID[nextID])
			else { //go checkout

				//get cookie to see how many items are in cart
				chrome.cookies.get({url: "http://www.supremenewyork.com", name: "cart"}, cookie => {

					for (var index in keywordID) {

						index = parseInt(index)
					    var nbItemInCart = cookie ? parseInt(cookie.value[0]) : 0

						if (nbItemInCart > 0 || request.rep) {

							var url;

							if (JSON.parse(localStorage["params"])['checkCart'])
								url = "http://www.supremenewyork.com/shop/cart"
							else
								url = "https://www.supremenewyork.com/checkout"

							chrome.tabs.update(tabId, { url: url })
							break
							
						} else if (index === keywordID.length - 1) {
							alert("No item found with provided keywords, please check them.")
							break
						}
					}
				})
			}
			break
	}
})

/*
	remove all images from cloudfront.net (all supreme's images are stored here)
*/
var listenerHandle = function() {
	return { cancel: true }
}

function removeImages() {
	chrome.webRequest.onBeforeRequest.addListener(
		listenerHandle,
		{
			urls: [
			   '*://*.cloudfront.net/*.jpg',
			   '*://*.cloudfront.net/*.png'
			]
		},
		['blocking']
	)
}