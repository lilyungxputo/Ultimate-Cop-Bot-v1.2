//find item by provided key
function find(key) {

	var articles = $.merge($("article"), $(".item"))
	var ended = 0 //this var is to know if item is detect or not. 1 => stop

	if (articles.length != 0) {

		chrome.runtime.sendMessage({msg: "keywordsData", id: key}, data => {

			Array.prototype.forEach.call(articles, (article, id, arr) => {

				var item = article

				if (item.childNodes !== undefined) {

					let itemId = id
					let itemUrl = item.childNodes[0].childNodes[0].getAttribute("href")
					let itemColor = item.childNodes[0].childNodes[2].childNodes[0].textContent.toLowerCase()
					let name = item.childNodes[0].childNodes[1].childNodes[0].textContent
					let isSoldOut = item.childNodes[0].childNodes[0].childNodes[1] != undefined ? true : false

					var keywords = data
					var nameMatches = 0

					keywords.keyword.split(" ").forEach((kw, index, array) => {

						kw = kw.toLowerCase()

						if (name.toLowerCase().indexOf(kw) > -1)
							nameMatches++

						if (index === array.length - 1) {

							let colorFound = keywords.color === ' ' ? true : itemColor.indexOf(keywords.color.toLowerCase()) > -1

							if (nameMatches === array.length && colorFound && ended == 0) {

								ended = 1

								if (!isSoldOut)
									location.href = "http://www.supremenewyork.com" + itemUrl + "#" + key //#key is for detect auto-purchase
								else
									chrome.runtime.sendMessage({msg: "cop", id: key})

							}
							else if (itemId === arr.length - 1 && index === array.length - 1 && ended == 0) {

								ended = 1
								chrome.runtime.sendMessage({msg: "cop", id: key})

							}

						}

					})

				}

			})

		})

	} else {

		chrome.runtime.sendMessage({msg: "cop", id: key})

	}

}