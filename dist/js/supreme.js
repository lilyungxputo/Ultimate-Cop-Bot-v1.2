const
	createQuickBuyButton = () => {
		var btn = document.createElement("input")
		btn.id = "quickbuy"
	    btn.type = "button"
	    btn.value = "instant buy"
	    btn.className = "button"
	    btn.style = "background-color: #000000; border-color: #000000; margin-top: 30px;"
	    btn.onclick = clickOnBuy
	    return btn
	},
	clickOnBuy = () => {
		var article = {
			name: document.title.split("Supreme: ")[1],
			price: (() => {
				for (var span in document.body.getElementsByTagName("span")) {
					span = document.body.getElementsByTagName("span")[span]
					if (span.getAttribute("itemprop")) {
						if (span.getAttribute("itemprop") == "price")
							return span.innerText
					}
				}
			})(),
			size: (() => {
				var s = document.getElementById("size")
				if (s.type != "hidden")
					return s.options[s.selectedIndex].text
				else
					return 0
			})()
		}
		if (confirm("Do you confirm the instant purchase of:\n\n" + article.name +", size: " + article.size + "\n\nFor the price of " + article.price + " ?\n\n(The parameter \"Auto-fill chekcout page and submit it\" must be enabled)") == true) {

			$.ajax({
				type: 'POST',
				url: $('#cart-addf').attr('action'),
				dataType: 'json',
				data: $('#cart-addf').serialize(),
				success: function(rep) {
					if (rep && rep.length) {
						location.href = "https://www.supremenewyork.com/checkout"
					}
				}
			})
			
		}
	}
const fillCheckout = () => {
	chrome.runtime.sendMessage({msg: "privateData"}, function(data) {
		var r = JSON.parse(data)

		chrome.runtime.sendMessage({msg: "params"}, function(settings) {

			if ($('#order_billing_country').find('option[value=' + r.country + ']').length > 0) {
				//this remove captcha but not stable, payment failed sometimes
				if (settings.removeCaptcha)
					$(".g-recaptcha").remove()

				//shipping
				$('#order_billing_name').val(r.name)
				$('#order_email').val(r.email)
				$('#order_tel').val(r.phone)
				$('#bo').val(r.address1)
				$('#oba3').val(r.address2)
				if (r.country != "USA" && r.country != "CANADA")
					$('#order_billing_address_3').val(r.address3)
				$('#order_billing_zip').val(r.zip)
				$('#order_billing_city').val(r.city)
				if (r.country == "USA")
					$('#order_billing_state').val(r.state)
				else if (r.country == "CANADA")
					$('#order_billing_state').val(r.province)
				$('#order_billing_country').val(r.country)

				//billing
				$('#credit_card_type').val(r.card_type)
				// various fields that could be valid on drop day in UK & US
				$("#card_details > div > input").eq(0).val(r.card_number)
				$("#card_details > div > input").eq(1).val(r.cvv)
				$("#card_details > div > select").eq(0).val(r.card_month);
				$("#card_details > div > select").eq(1).val(r.card_year);
				$('#credit_card_month').val(r.card_month)
				$('#credit_card_year').val(r.card_year)
				$(".icheckbox_minimal").click()
				if (settings.autoCheckout)
					setTimeout(() => $('[name=commit]').click(), 1380)

			}
		})
	})
}
// pages functions
const
	validUrl = {
		item: url => {
			if (url.indexOf("http://www.supremenewyork.com/shop/") != -1) {
				var forbidden = ['cart', 'all', 'sizing', 'shipping', 'terms', 'faq']
				, 	path = location.href.split('/')[4]
				
				if (forbidden.includes(path))
					return false
				else 
					return true
			} else {
				return false
			}
		},
		keyword: url => url.split("#")[1] !== undefined,
		quickCheckout: url => url.indexOf("/checkout") > -1,
		oldDrop: url => url.indexOf("?od") > -1,
		newDrop: url => url.indexOf("?nd;") > -1
	},
	pageAction = {
		createBuyButton: () => {
			const buttons = {
				addCart: document.getElementById('add-remove-buttons') ? document.getElementById('add-remove-buttons') : false,
				quickBuy: createQuickBuyButton()
			}
			if (buttons.addCart) {
				var className = buttons.addCart.childNodes[0].className
				if(className.indexOf("sold-out") == -1 && className != "button remove")
					buttons.addCart.insertBefore(buttons.quickBuy, buttons.addCart.childNodes[2])
			}
		},
		autoCheckout: () => {
			chrome.runtime.sendMessage({msg: "params"}, res => {
				if (res["autoFill"])
					fillCheckout()
			})
		}

	},
	_submitForm = () => {
		$.ajax({
			type: 'POST',
			url: $('#cart-addf').attr('action'),
			dataType: 'json',
			data: $('#cart-addf').serialize(),
			success: function(rep) {
				if (rep && rep.length) {
					chrome.runtime.sendMessage({msg: "cop", id: location.href.split("#")[1], rep: "ok"})
				}
			},
			error: function() {
				_submitForm()
			}
		})
	}

//main functions
function runKeyword() {
	
	var key = location.href.split("#")[1]
	
	chrome.runtime.sendMessage({msg: "keywordsData", id: key}, rep => {

		var sizeWanted = rep["size"]
		var sizeForm = document.getElementById("size") || document.getElementById("s")
		
		for (var index in sizeForm) {
			index = parseInt(index)
			var html = sizeForm[index] != undefined ? sizeForm[index].innerHTML : sizeWanted
			if (html == sizeWanted || sizeWanted == "0") {

				//check if size input exist
				if(sizeForm[index])
					sizeForm.value = sizeForm[index].value

				_submitForm()
				break
			 	
			}
			else if (index === sizeForm.length - 1) {
				chrome.runtime.sendMessage({msg: "params"}, res => {
					if (res["nextSize"])
						_submitForm()
					else 
						chrome.runtime.sendMessage({msg: "cop", id: key})
				})
				break
			}
		}
	})
}

function _init(params) {
	if (validUrl.item(location.href) && validUrl.keyword(location.href))
		runKeyword()
	else if (validUrl.quickCheckout(location.href)) {

		if (document.getElementById('order_billing_name') && params["autoFill"] && params["retryOnFail"])
			pageAction.autoCheckout()
		else if (document.getElementById('order_billing_name').value.length == 0 && params["autoFill"])
				pageAction.autoCheckout()

	} else {
		//create buy button if is not here
		setInterval(() => {
			if (!document.getElementById("quickbuy") && validUrl.item(location.href)) {
				pageAction.createBuyButton()
			}
		}, 100)

	}
}

chrome.runtime.sendMessage({msg: "params"}, res => {
   if (res["enabled"])
   		_init(res)
})
var oldItem;

if (validUrl.oldDrop(location.href)) {

	oldItem = getFirstItem()

	chrome.runtime.sendMessage({msg: "oldItem", item: oldItem}, rep => {
		location.href = rep.url + ';' + rep.item
	})
}
else if (validUrl.newDrop(location.href)) {
	oldItem = location.href.split(";")[1]

	//droplist updated!
	if (oldItem !== getFirstItem())
		chrome.runtime.sendMessage({msg: "startCop"})
	else {
		chrome.runtime.sendMessage({msg: "params"}, res => {
			var startTime = parseInt(res["startTime"].replace(/:/g, ""))
			var nowTime = parseInt(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").replace(/:/g, ""))

			if (nowTime > startTime + 3)
				chrome.runtime.sendMessage({msg: "startCop"})
			else
				setTimeout(() => location.reload(), 1212)
		})
	}
	
}

function getFirstItem() {
	if ($("article").length !== 0)
		return $("article")[0].childNodes[0].childNodes[0].childNodes[0].getAttribute("alt")
	else
		return 0
}