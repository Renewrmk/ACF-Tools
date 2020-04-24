var ready = (callback) => {
	if (document.readyState != "loading") callback();
	else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => { 
	copyFieldName();
	openDocs();
	appendCopyCodeBtns(); 
	copyFieldCode();
	// appendFieldNameOnEdit();
});

// Running some functions again when edits are made
document.addEventListener('click', (e) => {
	setTimeout(() => {
		copyFieldName();
		openDocs();
	}, 100);
});

/* --------------------
Copy the field name feature:
----------------------*/
function copyFieldName() {
	document.querySelectorAll(".acf-tbody .li-field-name").forEach(link => {
		if(!link.querySelectorAll('.copy-field-name').length) {
			var str = link.textContent,
				title = chrome.i18n.getMessage('copyFieldName');
			link.textContent = '';
			link.innerHTML = '<a href="#" class="copy-field-name" title="'+title+'">'+str+'</a>';
		}
	})
	document.addEventListener('click', function(e) {
		if (event.target.matches('.copy-field-name')) {
			e.preventDefault();
			copyStringToClipboard(e.target);
			copyMessage(chrome.i18n.getMessage('copiedFieldName'));
		}
	});
}

/* --------------------
Open ACF Field documentation:
----------------------*/
function openDocs() {
	document.querySelectorAll(".acf-tbody .li-field-type").forEach(link => {
		if(!link.querySelectorAll('.open-field-docs').length) {
			var str = link.textContent,
			title = chrome.i18n.getMessage('copyFieldName'),
				slug = link.closest('.acf-field-object').getAttribute('data-type').replace("_", "-"),
				url = "https://www.advancedcustomfields.com/resources/"+slug;
			link.textContent = '';
			link.innerHTML = '<a href="'+url+'" target="_blank" title="'+title+'" class="open-field-docs">'+str+'</a>';
		}
	})
}

/* --------------------
Copy ACF meta field code feature:
----------------------*/
function appendCopyCodeBtns() {
	appendCopyCodeBtn();
	appendCopyAllCodeBtn();
	// Append buttons to new fields
	document.addEventListener('click', function(e) {
		if (event.target.matches('.add-field')) {
			// Remove previously added buttons
			btns = document.querySelectorAll(".copy-field-code");
			btns.forEach(btn => {
				btn.remove();
			});
			// Appends new ones
			setTimeout(() => {
				appendCopyCodeBtn();
				appendCopyAllCodeBtn();
			}, 10);
		}
	});
	// Append a Copy code with sub fields button when changing a new field into a group or repeater
	document.querySelector(".acf-field-setting-type .field-type").addEventListener("change", (e) => {
		$(".copy-field-code.include-sub-fields").remove();
		setTimeout(() => {
			appendCopyAllCodeBtn();
		}, 1000);
	});

	// Append copy field code button
	function appendCopyCodeBtn() {
		var btnStr = chrome.i18n.getMessage('copyCodeBtn'),
			btnTitle = chrome.i18n.getMessage('copyCodeBtnTitle'),
			btnHTML = '<a class="button button-primary button-small copy-field-code exclude-sub-fields" title="'+btnTitle+'" href="#">'+btnStr+'</a>',
			row = document.querySelectorAll('.acf-field-object:not([data-type="accordion"]):not([data-type="message"]):not([data-type="tab"]) .row-options');
		row.forEach(row => {
			row.innerHTML += btnHTML;
		});
	}
	// Append copy all fields code button
	function appendCopyAllCodeBtn() {
		var btnStr = chrome.i18n.getMessage('copyAllCodeBtn'),
		btnTitle = chrome.i18n.getMessage('copyAllCodeBtnTitle'),
		btnHTML = '<a class="button button-primary button-small copy-field-code include-sub-fields" title="'+btnTitle+'" href="#">'+btnStr+'</a>',
		row = document.querySelectorAll('.acf-field-object[data-type="repeater"] > .handle .row-options, .acf-field-object[data-type="group"] > .handle .row-options');
		row.forEach(row => {
			row.innerHTML += btnHTML;
		});
	}
}

function getFieldName(thisField) {
	// Get field name
	return thisField
		.closest('.handle')

}

function getTypeOfField(thisField) {
	// Get type of field
	return thisField.closest(".acf-field-object").getAttribute("data-type");
}


function getReturnType(thisField, typeOfField) {
	// Output type for supported fields (This is used if a field has multiple types of output methods, such as Array, ID or URL)
	if (
		typeOfField == "image" ||
		typeOfField == "gallery" ||
		typeOfField == "link" ||
		typeOfField == "taxonomy" ||
		typeOfField == "user" ||
		typeOfField == "file"
	) {
		return thisField
			.closest(".acf-field-object")
			.querySelectorAll(".acf-field-setting-return_format li label.selected input")
			.value;
	} else {
		return null;
	}
}

function getSeniority(thisField) {
	// Check if sub element or not
	if (
		thisField
			.closest(".acf-field-object")
			.parents(".acf-field-setting-fc_layout").length ||
		thisField
			.closest(".acf-field-object")
			.parents(".acf-field-setting-sub_fields").length
	) {
		return "sub";
	} else {
		return "parent";
	}
}

function getPlace() {
	// Get field group place (basically checks if field is in options page or not)
	return $('.refresh-location-rule option[selected="selected"]').val();
}

function copyFieldCode() {
	// Copy field code
	document.addEventListener('click', function(e) {
		if (event.target.matches('.copy-field-code')) {
			e.preventDefault();
			var thisField = this,
				fieldName = getFieldName(thisField),
				typeOfField = getTypeOfField(thisField),
				returnType = getReturnType(thisField, typeOfField),
				seniority = getSeniority(thisField),
				place = getPlace(thisField),
				subFields = "";

			// If user clicked copy code with sub fields. This will get the first level of child items.
			if (thisField.hasClass("include-sub-fields")) {
				thisField
					.closest(".acf-field-object")
					.children(".settings")
					.children(".acf-table")
					.children(".acf-field-settings")
					.children(".acf-field-setting-sub_fields")
					.children(".acf-input")
					.children(".acf-field-list-wrap")
					.children(".acf-field-list")
					.children(".acf-field-object")
					.children(".handle")
					.find(".copy-field-code.exclude-sub-fields")
					.each(function() {
					var thisField = $(this),
						fieldName = getFieldName(thisField),
						typeOfField = getTypeOfField(thisField),
						returnType = getReturnType(thisField, typeOfField),
						seniority = getSeniority(thisField),
						place = getPlace(thisField);

					acf_field(appendCode = true, fieldName, typeOfField, returnType, seniority, place, "");

					subFields += sessionStorage.getItem("fieldcode");
				});
			}
			acf_field(appendCode = false, fieldName, typeOfField, returnType, seniority, place, subFields);

			// Clear session storage
			sessionStorage.removeItem("fieldcode");
		}
	});
}

/* --------------------
Show and copy the field name in posts and pages editor feature:
----------------------*/
function appendFieldNameOnEdit() {
	$('body:not(.post-type-acf-field-group)').find('.acf-field, .acf-th').each(function() {
		var fieldName = $(this).attr('data-name'),
			fieldNameInfo = '<a href="#" class="post-edit-field-name-info dashicons dashicons-info acf-js-tooltip" title="'+fieldName+'">'+fieldName+'</a>';
		if($(this).hasClass('acf-th')) {
			// If ACF display mode is table
			$(this).children('label').append(fieldNameInfo);
		} else {
			// If ACF display mode is anything else (block or row)
			$(this).children('.acf-label').children('label').append(fieldNameInfo);
		}
	});
	$('body').on('click', '.post-edit-field-name-info', function(e) {
		e.preventDefault();
		copyMessage(chrome.i18n.getMessage('copiedFieldName'));
		copyStringToClipboard($(this));
	})
}