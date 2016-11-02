// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);

	if (results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

// Takes an object and generates html with nested lists
function makeListItems(key, val) {
	var items = [];

	// class enables creating loan links in displayLoansList()
	items.push('<li class="' + key + '"><b>' + key + '</b><ul>');

	$.each(val, function(key, val) {
		if (typeof(val) == 'object') {
			items.push(makeListItems(key, val));
		} else {
			items.push('<li class="' + key + '">' + key + ': ' + val + '</li>');
		}
	});

	items.push('</ul></li>');

	return items.join('');
}

// Callback to replace the current content with a list of loans
// data: JSON response from /loans/search
// params: object with page and sector values
function displayLoansList(data, params) {
	// replace existing loans list with new results
	var items = [];
	items.push('<ul>');
	items.push(makeListItems('Loans', data.loans));
	items.push('</ul>');
	$('#results').html(items.join(''));


	// Pagination
	var page      = params.page;
	var sector    = params.sector;
	var pageCount = data.paging.pages;

	var prev_page = '';
	if (page > 1) {
		prev_page = '<a href="#" id="prevPage">Previous Page</a>';
	}
	var next_page = '';
	if (page < pageCount) {
		next_page = '<a href="#" id="nextPage">Next Page</a>';
	}

	$('<div/>').html(prev_page+' '+page+' of '+pageCount+' '+next_page)
		.appendTo('#results');
	$('#prevPage').click(function() {
		queryLoansList(page - 1, sector);
	});
	$('#nextPage').click(function() {
		queryLoansList(page + 1, sector);
	});



	// Create links to loan pages (opens in separate window)
	$('li.loans > ul > li > ul > li.id').each(function () {
		$(this).wrapInner('<a href="index.html?loan_id='+$(this).text().substring(4,$(this).text().length)+'" target="_blank"/>');
	});
}


// Callback to replace the current content with info about a single loan
// data: JSON response from /loans/:ids
function displayLoan(data) {
	var items = [];

	// Build the list
	items.push('<ul>');
	items.push(makeListItems("Loan", data.loans));
	items.push('</ul>');

	$('#results').html(items.join(''));
}


// Queries and displays list of loans (/loans/search)
function queryLoansList(page, sector) {
	var url = 'http://api.kivaws.org/v1/loans/search.json';
	var params = {};
	params.page = page;
	if (sector != null) {
		params.sector = sector;
	}

	$.getJSON(url, params, function(data) {
		displayLoansList(data, params);
	});
}


// Queries and displays info about a single loan (/loans/:ids)
function queryLoan(loan_id) {
	var url = 'http://api.kivaws.org/v1/loans/'+loan_id+'.json';
	$.getJSON(url, displayLoan);
}



// Create sector select and do the initial query
function loanListSetup() {
	// List of sectors
	// I wish these weren't hardcoded!
	var sectors = [
		'All',
		'Agriculture',
		'Arts',
		'Clothing',
		'Construction',
		'Education',
		'Entertainment',
		'Food',
		'Health',
		'Housing',
		'Manufacturing',
		'Personal Use',
		'Retail',
		'Services',
		'Transportation',
		'Wholesale'
	];

	// Create sector select
	var sectorSelect = [];
	sectorSelect.push('<select id="sector">');
	$.each(sectors, function(index, sector) {
		sectorSelect.push('<option value="' + sector + '">' + sector + '</option>');
	});
	sectorSelect.push('</select>');
	$("#content").prepend(sectorSelect.join(''));

	$("#sector").change(function() {
		var sector = $(this).val();
		if (sector == 'All') {
			sector = null;
		}
		queryLoansList(1, sector);
	});
	queryLoansList(1, null);
}


// Show info about a single loan if there is a loan_id parameter.
// Otherwise, show a list of the newest loans
function ready() {
	var loan_id = '';
	if (loan_id = getParameterByName('loan_id')) {
		queryLoan(loan_id);
	}
	else {
		loanListSetup();
	}
}


$(document).ready(ready);
