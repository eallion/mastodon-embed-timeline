// Mastodon embed timeline
// Forked from: https://github.com/AzetJP/mastodon-timeline-widget

// Account settings
document.addEventListener("DOMContentLoaded", () => {
	let mapi = new MastodonApi({
		container_id: 'mt-timeline',
		container_body_id: 'mt-body',
		instance_uri: 'https://mastodon.online',
		account_id: '180745',
		profile_name: '@idotj',
		toots_limit: 13,
		btn_see_more: 'See more posts at Mastodon'
	});
});

let MastodonApi = function (params_) {

	// Endpoint access settings
	this.INSTANCE_URI = params_.instance_uri;
	this.ACCOUNT_ID = params_.account_id;
	this.PROFILE_NAME = params_.profile_name;
	this.TOOTS_LIMIT = params_.toots_limit || 20;
	this.BTN_SEE_MORE = params_.btn_see_more || 'See more'

	// Target selectors
	this.mtIdContainer = document.getElementById(params_.container_id);
	this.mtBodyContainer = document.getElementById(params_.container_body_id);

	// Get the toots
	this.getToots();

	// Toot interactions
	this.mtIdContainer.addEventListener('click', function (event) {
		let urlToot = event.target.closest('.mt-toot').dataset.location;
		// Open Toot in new page avoiding any other natural link
 		if(event.target.localName != 'a' && event.target.localName != 'span' && urlToot){
			window.open(urlToot, '_blank');
		} 
	});

}

// Listing toots function
MastodonApi.prototype.getToots = function () {
	let mapi = this;

	// Get request
	fetch(this.INSTANCE_URI + '/api/v1/accounts/' + this.ACCOUNT_ID + '/statuses?limit=' + this.TOOTS_LIMIT, {
        method: 'get',
    })
    .then(response => response.json())
    .then(jsonData => {
		// console.log('jsonData: ', jsonData);

		// Clear the loading message
		this.mtBodyContainer.innerHTML = '';

		// Add toots
		for (let i in jsonData) {
			if (jsonData[i].visibility == 'public') {
				// List only public toots
				appendToot.call(mapi, jsonData[i]);
			}
		}

		// Add target="_blank" to all hashtags
		let allHashtags = document.querySelectorAll("#mt-timeline .hashtag");
		for(let j=0; j<allHashtags.length; j++) {
			allHashtags[j].target = "_blank";
			allHashtags[j].rel = "tag noopener noreferrer";
		}
		
		// Insert button to visit account page, after last toot
		this.mtBodyContainer.insertAdjacentHTML('beforeend', '<div class="mt-seeMore"><a href="' + mapi.INSTANCE_URI + '/' + mapi.PROFILE_NAME + '" class="btn" target="_blank" rel="noopener noreferrer">' + mapi.BTN_SEE_MORE + '</a></div>');
	})
    .catch(err => {
		this.mtBodyContainer.innerHTML = '<div class="d-flex h-100"><div class="w-100 my-auto text-center">✖️<br/>Request Failed:<br/>' + err + '</div></div>';
    });

	// Inner function to add each toot content in container
	let appendToot = function (status_) {
		let avatar, user, content, url, date;

		if (status_.reblog) {
			// BOOSTED toot
			// Toot url
			url = status_.reblog.url;

			// Boosted avatar
			avatar =
				'<a href="' + status_.reblog.account.url + '" class="mt-avatar mt-avatar-boosted" style="background-image:url(' + status_.reblog.account.avatar + ');" rel="noopener noreferrer" tabindex="-1" target="_blank">'
					+ '<div class="mt-avatar mt-avatar-booster" style="background-image:url(' + status_.account.avatar + ');">'
					+ '</div>'
					+ '<span class="visually-hidden">'
						+ status_.account.username
					+ '</span>'						
				+ '</a>';

			// User name and url
			user = 
				'<div class="mt-user">'
					+ '<a href="' + status_.reblog.account.url + '" rel="noopener noreferrer" tabindex="-1" target="_blank">'
						+ status_.reblog.account.username
					+ '</a>'
				+ '</div>';

			// Date
			date = this.formatDate(status_.reblog.created_at);				
		} else {
			// STANDARD toot
			// Toot url
			url = status_.url;

			// Avatar
			avatar =
				'<a href="' + status_.account.url + '" class="mt-avatar" style="background-image:url(' + status_.account.avatar + ');" rel="noopener noreferrer" tabindex="-1" target="_blank">'
					+ '<span class="visually-hidden">'
						+ status_.account.username
					+ '</span>'				
				+ '</a>';

			// User name and url
			user =
				'<div class="mt-user">'
					+ '<a href="' + status_.account.url + '" rel="noopener noreferrer" tabindex="-1" target="_blank">'
						+ status_.account.username
					+ '</a>'
				+ '</div>';

			// Date
			date = this.formatDate(status_.created_at);				
		}

		// Main content
		if(status_.spoiler_text != '') {
			content = 
			'<div class="toot-text">'
				+ status_.spoiler_text
				+ ' [Show more...]'
			+ '</div>';				
		} else {
			content = 
			'<div class="toot-text">'
				+ status_.content
			+ '</div>';	
		}

		// Media attachments
		let media = '';
		if (status_.media_attachments.length > 0) {
			for (let picid in status_.media_attachments) {
				media = this.replaceMedias(status_.media_attachments[picid], status_.sensitive);
			}
		}

		// Poll
		let poll = '';
		let pollOption = '';
		if (status_.poll) {
			for (let i in status_.poll.options) {
				pollOption +=
					'<li>'
						+ status_.poll.options[i].title
					+ '</li>';
			}
			poll = 
				'<div class="toot-poll">'
					+ '<ul>'
						+ pollOption
					+ '</ul>'
				+'</div>';
		}

		// Date
		let timestamp =
			'<div class="toot-date">'
				+ '<a href="' + url + '" rel="noopener noreferrer" tabindex="-1" target="_blank">'
				+ date
				+ '</a>'
			+ '</div>';

		// Add all to main toot container
		let toot =
			'<div class="mt-toot border-bottom" data-location="' + url + '">'
				+ avatar
				+ user
				+ content
				+ media
				+ poll
				+ timestamp
			+ '</div>';

		this.mtBodyContainer.insertAdjacentHTML('beforeend', toot);
	};

};

// Place media
MastodonApi.prototype.replaceMedias = function (media_, spoiler_) {
	let spoiler = spoiler_ || false;
	let pic = 
	'<div class="toot-media ' + (spoiler ? 'toot-media-spoiler' : '') + ' img-ratio14_7 loading-spinner">'
		+ '<img onload="removeSpinner(this)" onerror="removeSpinner(this)" src="' + media_.preview_url + '" alt="" loading="lazy" />'
	+ '</div>';

	return pic;
};

// Format date
MastodonApi.prototype.formatDate = function (date_) {
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	];

	let date = new Date(date_);

	let displayDate = monthNames[date.getMonth()]
		+ " " + date.getDate()
		+ ", " + date.getFullYear();

	return displayDate;
};

// Loading spinner
function removeSpinner(element) {
	const spinnerCSS = 'loading-spinner';
	// Find closest parent container (1st, 2nd or 3rd level)
	let spinnerContainer = element.closest('.' + spinnerCSS);
	if(spinnerContainer){
		spinnerContainer.classList.remove(spinnerCSS);
	}
}