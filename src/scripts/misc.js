function copyMessage(message) {
	var dismissBtn = '<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>'
		noticeHTML = '<div class="acftools-message notice notice-success is-dismissible"><p>'+message+'</p>'+dismissBtn+'</div>';
	// Remove if it already exists
	if(document.querySelectorAll(".acftools-message").length) {
		document.querySelector(".acftools-message").remove();
	}
	// Append a new notice
	document.body.insertAdjacentHTML('beforeend', noticeHTML);
	// Remove when x is clicked
	document.querySelector(".acftools-message .notice-dismiss").addEventListener("click", () => {
		document.querySelector(".acftools-message").remove();
	})
}

function copyStringToClipboard(element) {
	let temp = document.body.appendChild(document.createElement('input'))
	temp.value = element.textContent.trim();
	temp.select();
    document.execCommand("copy");
	temp.remove();
}

function copyCodeToClipboard(fieldCode, subFields) {
	var temp = $("<textarea></textarea>")
		.val(fieldCode)
		.appendTo("body")
		.select();
	document.execCommand("copy");
	temp.remove();
	
	if(subFields.length) {
		copyMessage(chrome.i18n.getMessage('copiedCodeSub'));
	} else {
		copyMessage(chrome.i18n.getMessage('copiedCode'));
	}
}

function fieldError() {
	alert(chrome.i18n.getMessage('fieldError'));
	throw new Error(chrome.i18n.getMessage('fieldError'));
}
