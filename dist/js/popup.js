const
	keywordData = JSON.parse(localStorage["keyword"]),
	settings = JSON.parse(localStorage["params"]),
	enabledExtension = settings["enabled"],
	start = document.getElementById("start"),
	isKwInstalled = () => keywordData[0]['keyword'] != '' ? true : false, ////check if keywords are configured
	startBot = () => {
		if (localStorage['data'].length > 4) {

			chrome.runtime.sendMessage({msg: 'startBot'})

			var nowTime = parseInt(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").replace(/:/g, ""))
			var startTime = parseInt(settings["startTime"].replace(/:/g, ""))

			if (Number.isInteger(startTime) && nowTime < startTime)
				loaderCountdown(settings["startTime"])
			else
				$("#loader").html("<u>Bot has been started.</u>")

			$("#loader").fadeIn("fast")

			start.className = 'button disabled'
			start.disabled = true
			start.onclick = null
			
		} else {
			alert("You must fill shipping/billing information.")
		}
	}
	loaderCountdown = startTime => {
		var separation = startTime.split(':')
		var startSeconds = (+separation[0]) * 60 * 60 + (+separation[1]) * 60 + (+separation[2])
		var refresh = setInterval(() => {
			let nowTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
			let separationNow = nowTime.split(':')
			let nowSeconds = (+separationNow[0]) * 60 * 60 + (+separationNow[1]) * 60 + (+separationNow[2])
			let seconds = startSeconds - nowSeconds
			if (seconds == 0) {
				clearInterval(refresh)
				$("#loader").html("<u>Bot has been started.</u>")
			} else
				$("#loader").html("Bot will start in " + seconds + " seconds.")
		}, 1000)
	}

if (isKwInstalled() && enabledExtension) {
	start.className = 'button start'
	start.disabled = false
	start.onclick = startBot
}

document.getElementById("nbkws").innerHTML = (() => {
	var nb = keywordData[0]['keyword'] != '' ? Object.keys(keywordData).length : 0

	return '<b>You have set ' + nb + ' keywords.</b>'
})()

document.getElementById('settings').onclick = () => chrome.tabs.create({ url: location.href.replace("popup", "settings") })
