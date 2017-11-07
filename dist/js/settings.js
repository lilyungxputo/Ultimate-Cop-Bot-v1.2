const
	DATA = JSON.parse(localStorage["data"]),
	generateExpireDate = () => {
		const expireMonth = document.getElementById("card_month")
		for (var m = 1; m <= 12; m++) {
			m = m.toString()
			m = m.length < 2 ? "0" + m : m
			var option = document.createElement("option")
			option.text = m, option.value = m
			expireMonth.add(option)
		}

		const expireYear = document.getElementById("card_year"), currentYear = new Date().getFullYear()
		for (var y = currentYear; y <= currentYear + 10; y++) {
			var option = document.createElement("option")
			option.text = y, option.value = y
			expireYear.add(option)
		}
	},
	Data = {
		fieldsShipping: ["name",
				"email",
				"phone",
				"address1",
				"address2",
				"address3",
				"city",
				"zip",
				'state',
				'province',
				"country"],
		fieldsBilling: ["card_number",
						"card_year",
						"card_month",
						"card_type",
						"cvv"],
		fill: () => {
			var inputs = Data.fieldsShipping.concat(Data.fieldsBilling)
			inputs.forEach(data => {
				if (typeof DATA[data] !== "undefined")
					document.getElementById(data).value = DATA[data]

				//display province/state if country is canada/usa
				if (data == 'country') {
					if (DATA.country == "USA")
						document.getElementById('state_row').style = ''
					else if (DATA.country == "CANADA")
						document.getElementById('province_row').style = ''
				}
			})
		},
		checkIfShippingFilled: cb => {
			var error = ''
			Data.fieldsShipping.forEach((input, index, array) => {
				if (document.getElementById(input).value == '' && $('#'+input).is(":visible")) {
					//address2 and 3 are optional
					if (input != "address2" && input != "address3") {
						error += "- Field " + input + " is empty.<br/>"
					}
				}
				if (index === array.length - 1) cb(error)
			})
		},
		checkIfBillingFilled: cb => {
			var error = ''
			Data.fieldsBilling.forEach((input, index, array) => {
				if (document.getElementById(input).value == '' && $('#'+input).is(":visible")) {
					error += "- Field " + input + " is empty.<br/>"
				}
				if (index === array.length - 1) cb(error)
			})
		}
	},
	countryChange = () => {
		var country = document.getElementById('country')
		if (country.value == "USA") {
			document.getElementById('state_row').style = ''
			document.getElementById('province_row').style.display = 'none'
		}
		else if (country.value == "CANADA") {
			document.getElementById('province_row').style = ''
			document.getElementById('state_row').style.display = 'none'
		} else {
			document.getElementById('province_row').style.display = 'none'
			document.getElementById('state_row').style.display = 'none'
		}
	},
	editShipping = () => {
		Data.checkIfShippingFilled(r => {
			if (r.length == 0) {
				dsp("Information has been updated", "success")
				var dataObj = JSON.parse(localStorage["data"])
				Data.fieldsShipping.forEach((data, index, array) => {
					dataObj[data] = document.getElementById(data).value
					if (index === array.length - 1) 
						localStorage["data"] = JSON.stringify(dataObj)
				})
			} else dsp(r, "error")		
		})
	},
	editBilling = () => {
		Data.checkIfBillingFilled(r => {
			if (r.length == 0) {
				dsp("Information has been updated", "success")
				var dataObj = JSON.parse(localStorage["data"])
				Data.fieldsBilling.forEach((data, index, array) => {
					dataObj[data] = document.getElementById(data).value
					if (index === array.length - 1) 
						localStorage["data"] = JSON.stringify(dataObj)
				})
			} else dsp(r, "error")		
		})
	}

document.getElementById('country').onchange = countryChange

document.getElementById("billingSubmit").onclick = editBilling
document.getElementById("shippingSubmit").onclick = editShipping

const 
	keywordfields = ['category', 'keyword', 'color', 'size'],
	differentSize = {"pants":
							"<option>30</option>" + 
							"<option>32</option>" +
							"<option>34</option>" +
							"<option>36</option>" +
							"<option value=\"0\">No matter</option>",
					"shorts":
							"<optgroup label='Standard Sizes (i.e water shorts)'>" +
							"<option>Small</option>" +
	                        "<option>Medium</option>" +
	                        "<option>Large</option>" +
	                        "<option>XLarge</option>" +
	                        "</optgroup>" +
	                        "<optgroup label='Pants Sizes'>" +
	                        "<option>30</option>" + 
							"<option>32</option>" +
							"<option>34</option>" +
							"<option>36</option>" +
							"</optgroup>" +
	                        "<option value=\"0\">No matter</option>",
				    "shoes":
							"<option>US 7 / UK 6</option>" + 
							"<option>US 7.5 / UK 6.5</option>" +
							"<option>US 8 / UK 7</option>" +
							"<option>US 8.5 / UK 7.5</option>" +
							"<option>US 9 / UK 8</option>" +
							"<option>US 9.5 / UK 8.5</option>" +
							"<option>US 10 / UK 9</option>" +
							"<option>US 10.5 / UK 9.5</option>" +
							"<option>US 11 / UK 10</option>" +
							"<option>US 11.5 / UK 10.5</option>" +
							"<option>US 12 / UK 11</option>" +
							"<option value=\"0\">No matter</option>",
					"default":
							"<option>Small</option>" +
	                        "<option>Medium</option>" +
	                        "<option>Large</option>" +
	                        "<option>XLarge</option>" +
	                        "<option value=\"0\">No matter</option>"},
	editKeyword = () => {
		var keywordData = {}, error = ""
		Array.prototype.forEach.call(document.getElementsByClassName("kwf"), (element, divIndex, divArray) => {
			var ID = parseInt(element.id.split("[")[1])
			keywordData[ID] = {}
			//check if fields are filled
			keywordfields.forEach((data, fieldIndex, fieldArray) => {
				var fieldName = data + "[" + ID + "]"
				if (document.getElementById(fieldName).value == '') {
					error += "- Field " + fieldName + " is empty.<br/>"
				} else {
					keywordData[ID][data] = document.getElementById(fieldName).value
				}
				if (divIndex === divArray.length - 1 && fieldIndex === fieldArray.length - 1) {
					if (error.length == 0) {
						localStorage["keyword"] = JSON.stringify(keywordData)
						dsp("Keywords has been updated.", "success")
					} else dsp(error, "error")
				}
			})
		})
	},
	getNextFormId = () => {
		if (document.getElementById("addKeywordForm").previousSibling.data !== undefined)
			return parseInt(document.getElementById("addKeywordForm").previousSibling.previousSibling.id.split("[")[1]) + 1
		else
			return parseInt(document.getElementById("addKeywordForm").previousSibling.id.split("[")[1]) + 1
	}

function addKeywordForm(id) {
	var formId = Number.isInteger(parseInt(id)) ? id : getNextFormId(),
		newForm = document.createElement('div'),
		deleteLine = formId != 0 ? '<tr><td colspan="2""><center><button class="btn btn-sm btn-danger" id="removeForm['+formId+']">X</button></center></td</tr>' : ''
	newForm.className = "col-lg-6 kwf"
	newForm.id = "keywordForm["+formId+"]"
	newForm.innerHTML = '<table class="table table-sm" style="margin-top: 20px;">' +
                            '<tbody>' +
                                '<tr><td>Category</td><td>' +
                                    '<select class="form-control" id="category['+formId+']">' +
                                        '<option value="jackets">jackets</option>' +
                                        '<option value="shirts">shirts</option>' +
                                        '<option value="tops_sweaters">tops/sweaters</option>' +
                                        '<option value="sweatshirts">sweatshirts</option>' +
                                        '<option value="pants">pants</option>' +
                                        '<option value="shorts">shorts</option>' +
                                        '<option value="t-shirts">t-shirts</option>' +
                                        '<option value="hats">hats</option>' +
                                        '<option value="bags">bags</option>' +
                                        '<option value="shoes">shoes</option>' +
                                        '<option value="accessories">accessories</option>' +
                                        '<option value="skate">skate</option>' +
                                    '</select>' +
                                '</td></tr>' +
                                '<tr><td>Keywords <i>(Separated from a space)</i></td><td><input class="form-control" id="keyword['+formId+']" type="text"/></td></tr>' +
                                '<tr><td>Color <i>(Leave a space if no matter)</i></td><td><input class="form-control" id="color['+formId+']" type="text"/></td></tr>' +
                                '<tr><td>Size</td><td>' +
                                    '<select class="form-control" id="size['+formId+']">'
                                        + differentSize.default +
                                    '</select>' +
                                '</td></tr>' +
                                deleteLine +
                            '</tbody>' +
                        '</table>'

    //add the form
	document.getElementById("keywordsForm").insertBefore(newForm, document.getElementById("addKeywordForm"))

	//fill form
	if (Number.isInteger(parseInt(id))) {
		var data = JSON.parse(localStorage["keyword"])[id]
		keywordfields.forEach(name => {
			var field = name + "[" + id + "]"
			if (name == "size") {
				var category = JSON.parse(localStorage["keyword"])[formId]["category"]
				if (differentSize[category] !== undefined)
					document.getElementById(field).innerHTML = differentSize[category]
				else
					document.getElementById(field).innerHTML = differentSize["default"]
			}
			document.getElementById(field).value = data[name]
		})
	}

	//change size list
	document.getElementById("category["+formId+"]").onchange = () => {
		var category = document.getElementById("category["+formId+"]").value
		if (differentSize[category] !== undefined)
			document.getElementById("size["+formId+"]").innerHTML = differentSize[category]
		else
			document.getElementById("size["+formId+"]").innerHTML = differentSize["default"]
	}
	//delete form, we can't delete keyword with id 0
	if (formId != 0)
		document.getElementById('removeForm['+formId+']').onclick = () => 
			document.getElementById("keywordsForm").removeChild(document.getElementById("keywordForm["+formId+"]"))
}


//for each keywords set, we show forms
for(var key in JSON.parse(localStorage["keyword"]))
	addKeywordForm(key)

document.getElementById('addKeywordButton').onclick = addKeywordForm
document.getElementById('editKeyword').onclick = editKeyword
const rightMargin = $(".tab-pane.active").css('marginRight')

$(".nav-item").click(e => {

	var elementToDisplay = $("#" + e.target.getAttribute("show"))

	if (elementToDisplay.length === 0)
		return
	
	//NAVBAR
	$(".nav-item.active").removeClass("active")
	$(e.target).parent().addClass("active")

	//DIV
	var elementToHide = $(".tab-pane.active")
	elementToHide.animate({'margin-left': '-1000px'}, 400, () => {

		elementToHide.removeClass('active')
		elementToHide.hide(1, () => {

			elementToHide.css({'marginLeft': 'auto', 'marginRight': '-1000px'})

			elementToDisplay.animate({'margin-right': rightMargin}, 400)
			elementToDisplay.addClass('active')
			elementToDisplay.show()
		})
	})
})

$("#settings tr").mouseover(e => {
	var id = e.currentTarget.childNodes[1].childNodes[0].id || e.currentTarget.childNodes[1].childNodes[0].childNodes[0].id
	$("#docSettings").html(getSettingsDoc(id))
})

function getSettingsDoc(id) {
	switch (id) {
		case 'enabled':
			return "If this box is not checked, bot will be totally disabled."
		case 'checkCart':
			return "If you use keywords and if you found one or more items, this option will let you check your cart before checkout. We recommand you to use this option."
		case 'autoFill':
			return "When you are on checkout page (URL: http://supremenewyork.com/checkout), the form will be automatically filled with your information."
		case 'autoCheckout':
			return "The checkout form will be submitted automatically if this option is enabled."
		case 'retryOnFail':
			return "If when you are purchasing you got an error, the bot will try again until payment done <i style=\"color: #fff;\">(Option \"Auto-fill checkout page and submit it\" must be enabled)</i>"
		case 'nextSize':
			return "With keywords you can choose the wanted size, if size is sold-out, the bot will choose the next one."
		case 'startTime':
			return "Exact hour of the drop is recommanded. Start time must be in this format hh:mm:ss (ex: 14:23:54), if you put \"0\" as value, this option will be disabled. It permit to start the bot as the wanted time by click on \"Start\" on popup. <b>To use this option, you must be on Supreme page and don’t leave it."
		case 'startWhenUpdated':
			return "<b>Previous feature must be enabled.</b> Start the bot at the second when the new drop list is online. The bot must be started by the Start button."
		case 'removeCaptcha':
			return "This feature remove the captcha on checkout page. This option is not recommanded because payment can fail."
		case 'hideImages':
			return "Remove all images on www.supremenewyork.com, recommanded if you've a weak internet connection."
	}
}

const 
	paramsFields = ["startTime"],
	checkBox = ["enabled", "checkCart", "autoFill", "autoCheckout", "retryOnFail", "nextSize", "removeCaptcha", "startWhenUpdated", "hideImages"],
	//format time to hh:mm:ss. ex: 22:14:45 
	formatTime = (time, callback) => {
		time = time.toString()
		    if (isNaN(parseInt(time)))
				callback("00:00:00")
			else {
				if (time.length < 6) {
					while(time.length != 6)
							time += "0"
				}
				let hours = parseInt(time.substr(0,2)) > 23 ? "00" : time.substr(0,2)
				let minutes = parseInt(time.substr(2,2)) > 59 ? "00" : time.substr(2,2)
				let seconds = parseInt(time.substr(4,2)) > 59 ? "00" : time.substr(4,2)
				time = hours + ":" + minutes + ":" + seconds
				callback(time)
			}
	},
	updateParams = () => {

		var dataObj = {}
		Array.prototype.push.apply(paramsFields, checkBox)

		paramsFields.forEach((data, index, array) => {

			var value = document.getElementById(data).type == "checkbox" 
						? document.getElementById(data).checked 
						: document.getElementById(data).value
			
			if(value != "")
				dataObj[data] = value

			if (data === "hideImages")
				chrome.runtime.sendMessage({msg: "updateRemoveImages", enabled: value})

			if (index === array.length - 1) {

				//we set the startTime at the end of the loop
				var rawTime = dataObj["startTime"].replace(/:/g, "")

				formatTime(rawTime, time => {

					dataObj["startTime"] = time
					localStorage["params"] = JSON.stringify(dataObj)

				})
			}
		})
		dsp("Settings has been updated.", "success")
	}

/*
	fill inputs with localStorage
*/
Array.prototype.push.apply(paramsFields, checkBox)
paramsFields.forEach(data => {
	if (typeof JSON.parse(localStorage["params"])[data] !== "undefined") {
		if (document.getElementById(data).type != "checkbox")
			document.getElementById(data).value = JSON.parse(localStorage["params"])[data]
		else
			document.getElementById(data).checked = JSON.parse(localStorage["params"])[data]
	}
})

document.getElementById('editParams').onclick = updateParams
const
	//display modal with success/error message
	dsp = (msg, type) => {
		if(type != "success") type = "danger"
		document.getElementById("modal-text").innerHTML = msg
		document.getElementById("close-modal").className = "btn btn-"+type
		$('#important-msg').modal()  
	},
	//init all settings page
	 _init = () => {
		generateExpireDate()
		Data.fill()
	}

document.title = "UCB v" + chrome.runtime.getManifest().version

document.body.onload = _init
