// Mastodon embed feed timeline v3.2.0
// More info at:
// https://gitlab.com/idotj/mastodon-embed-feed-timeline

// Timeline settings
document.addEventListener("DOMContentLoaded", () => {
	let mapi = new MastodonApi({
		container_body_id: 'mt-body',
		instance_uri: 'https://mastodon.online',
		user_id: '180745',
		profile_name: '@idotj',
		toots_limit: '20',
		hide_reblog: false,
		hide_replies: false,
		text_max_lines: '0',
		btn_see_more: 'See more posts at Mastodon'
	});
});

let MastodonApi = function (params_) {

	// Endpoint access settings
	this.INSTANCE_URI = params_.instance_uri;
	this.USER_ID = params_.user_id;
	this.PROFILE_NAME = params_.profile_name;
	this.TOOTS_LIMIT = params_.toots_limit || '20';
	this.HIDE_REBLOG = typeof params_.hide_reblog !== 'undefined' ? params_.hide_reblog : false;
	this.HIDE_REPLIES = typeof params_.hide_replies !== 'undefined' ? params_.hide_replies : false;
	this.TEXT_MAX_LINES = params_.text_max_lines || '0';
	this.BTN_SEE_MORE = params_.btn_see_more;

	// Target selector
	this.mtBodyContainer = document.getElementById(params_.container_body_id);

	// Get the toots
	this.getToots();

	// Toot interactions
	this.mtBodyContainer.addEventListener('click', function (event) {
		// Check if clicked in a toot
		if (event.target.localName == 'article' || event.target.offsetParent.localName == 'article') {
			openTootURL(event);
		}
		// Check if clicked in Show More/Less button
		if (event.target.localName == 'button' && event.target.className == 'spoiler-link') {
			showTootSpoiler(event);
		}
	});
	this.mtBodyContainer.addEventListener('keydown', function (event) {
		if (event.code === 'Enter' && event.target.localName == 'article') {
			openTootURL(event);
		}
	});

	// Open Toot in a new page avoiding any other natural link
	function openTootURL(event) {
		let urlToot = event.target.closest('.mt-toot').dataset.location;
		if (event.target.localName !== 'a' && event.target.localName !== 'span' && event.target.localName !== 'button' && urlToot) {
			window.open(urlToot, '_blank');
		}
	}

	// Show/hide content if click on spoiler button
	function showTootSpoiler(event) {
		let spoilerText = event.target.nextSibling;
		let spoilerBtnText = event.target.textContent;

		spoilerText.classList.toggle('spoiler-text');
		if (spoilerBtnText == 'Show more') {
			spoilerBtnText = 'Show less';
			event.target.setAttribute('aria-expanded', 'true');
		} else {
			spoilerBtnText = 'Show more';
			event.target.setAttribute('aria-expanded', 'false');
		}

	}

}

// Listing toots function
MastodonApi.prototype.getToots = function () {
	let mapi = this;

	// Get request
	fetch(this.INSTANCE_URI + '/api/v1/accounts/' + this.USER_ID + '/statuses?limit=' + this.TOOTS_LIMIT, {
		method: 'get',
	})
		.then(response => response.json())
		.then(jsonData => {
			// console.log('jsonData: ', jsonData);

			// Clear the loading message
			this.mtBodyContainer.innerHTML = '';

			// Add toots
			for (let i in jsonData) {
				// List only public toots
				if (jsonData[i].visibility == 'public' || jsonData[i].visibility == 'unlisted') {
					if (mapi.HIDE_REBLOG && jsonData[i].reblog || mapi.HIDE_REPLIES && jsonData[i].in_reply_to_id) {
						// Nothing here (Don't append boosts and/or replies toots)
					} else {
						appendToot.call(mapi, jsonData[i], i);
					}
				}
			}

			// Add target="_blank" to all hashtags
			let allHashtags = document.querySelectorAll("#mt-body .hashtag");
			for (let j = 0; j < allHashtags.length; j++) {
				allHashtags[j].target = "_blank";
				allHashtags[j].rel = "tag nofollow noopener noreferrer";
			}

			// Insert button after last toot to visit account page
			if (mapi.BTN_SEE_MORE) {
				this.mtBodyContainer.insertAdjacentHTML('beforeend', '<div class="mt-seeMore"><a href="' + mapi.INSTANCE_URI + '/' + mapi.PROFILE_NAME + '" class="btn" target="_blank" rel="nofollow noopener noreferrer">' + mapi.BTN_SEE_MORE + '</a></div>');
			}
		})
		.catch(err => {
			this.mtBodyContainer.innerHTML = '<div class="d-flex h-100"><div class="w-100 my-auto text-center">✖️<br/>Request Failed:<br/>' + err + '</div></div>';
		});

	// Inner function to add each toot content in container
	let appendToot = function (status_, index) {
		let avatar, user, content, url, date;

		if (status_.reblog) {
			// BOOSTED toot
			// Toot url
			url = status_.reblog.url;

			// Boosted avatar
			avatar =
				'<a href="' + status_.reblog.account.url + '" class="mt-avatar mt-avatar-boosted" style="background-image:url(' + status_.reblog.account.avatar + ');" rel="nofollow noopener noreferrer" target="_blank">'
				+ '<div class="mt-avatar mt-avatar-booster" style="background-image:url(' + status_.account.avatar + ');">'
				+ '</div>'
				+ '<span class="visually-hidden">'
				+ status_.account.username + ' avatar'
				+ '</span>'
				+ '</a>';

			// User name and url
			user =
				'<div class="mt-user">'
				+ '<a href="' + status_.reblog.account.url + '" rel="nofollow noopener noreferrer" target="_blank">'
				+ status_.reblog.account.username + '<span class="visually-hidden"> post</span>'
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
				'<a href="' + status_.account.url + '" class="mt-avatar" style="background-image:url(' + status_.account.avatar + ');" rel="nofollow noopener noreferrer" target="_blank">'
				+ '<span class="visually-hidden">'
				+ status_.account.username + ' avatar'
				+ '</span>'
				+ '</a>';

			// User name and url
			user =
				'<div class="mt-user">'
				+ '<a href="' + status_.account.url + '" rel="nofollow noopener noreferrer" target="_blank">'
				+ status_.account.username + '<span class="visually-hidden"> post</span>'
				+ '</a>'
				+ '</div>';

			// Date
			date = this.formatDate(status_.created_at);
		}

		// Main text
		let text_css = '';
		if (this.TEXT_MAX_LINES !== '0') {
			text_css = 'truncate';
			document.documentElement.style.setProperty('--text-max-lines', this.TEXT_MAX_LINES);
		}

		if (status_.spoiler_text !== '') {
			content =
				'<div class="toot-text">'
				+ status_.spoiler_text
				+ ' <button type="button" class="spoiler-link" aria-expanded="false">Show more</button>'
				+ '<div class="spoiler-text">'
				+ status_.content
				+ '</div>'
				+ '</div>';
		} else if (status_.reblog && status_.reblog.content !== '') {
			content =
				'<div class="toot-text' + ' ' + text_css + '">'
				+ '<div>'
				+ status_.reblog.content
				+ '</div>'
				+ '</div>';
		} else {
			content =
				'<div class="toot-text' + ' ' + text_css + '">'
				+ '<div>'
				+ status_.content
				+ '</div>'
				+ '</div>';
		}

		// Media attachments
		let media = '';
		if (status_.media_attachments.length > 0) {
			for (let picid in status_.media_attachments) {
				media = this.replaceMedias(status_.media_attachments[picid], status_.sensitive);
			}
		}
		if (status_.reblog && status_.reblog.media_attachments.length > 0) {
			for (let picid in status_.reblog.media_attachments) {
				media = this.replaceMedias(status_.reblog.media_attachments[picid], status_.sensitive);
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
				+ '</div>';
		}

		// Date
		let timestamp =
			'<div class="toot-date">'
			+ '<a href="' + url + '" rel="nofollow noopener noreferrer" tabindex="-1" target="_blank">'
			+ date
			+ '</a>'
			+ '</div>';

		// Add all to main toot container
		let toot =
			'<article class="mt-toot border-bottom" aria-posinset="' + (Number(index) + 1) + '" aria-setsize="' + this.TOOTS_LIMIT + '" data-location="' + url + '" tabindex="0">'
			+ avatar
			+ user
			+ content
			+ media
			+ poll
			+ timestamp
			+ '</article>';

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
	if (spinnerContainer) {
		spinnerContainer.classList.remove(spinnerCSS);
	}
}
