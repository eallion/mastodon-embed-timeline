/**
 * Mastodon embed feed timeline v3.11.0
 * More info at:
 * https://gitlab.com/idotj/mastodon-embed-feed-timeline
 */

/**
 * Timeline settings
 * Adjust these parameters to customize your timeline
 */
window.addEventListener("load", () => {
  const mastodonTimeline = new MastodonApi({
    // Id of the <div> containing the timeline
    container_body_id: "mt-body",

    // Class name for the loading spinner (also used in CSS file)
    spinner_class: "loading-spinner",

    // Preferred color theme: 'light', 'dark' or 'auto'. Default: auto
    default_theme: "auto",

    // Your Mastodon instance
    instance_url: "https://mastdn.social",

    // Choose type of toots to show in the timeline: 'local', 'profile', 'hashtag'. Default: local
    timeline_type: "local",

    // Your user ID number on Mastodon instance. Leave it empty if you didn't choose 'profile' as type of timeline
    user_id: "",

    // Your user name on Mastodon instance (including the @ symbol at the beginning). Leave it empty if you didn't choose 'profile' as type of timeline
    profile_name: "",

    // The name of the hashtag (not including the # symbol). Leave it empty if you didn't choose 'hashtag' as type of timeline
    hashtag_name: "",

    // Maximum amount of toots to get. Default: 20
    toots_limit: "20",

    // Hide unlisted toots. Default: don't hide
    hide_unlisted: false,

    // Hide boosted toots. Default: don't hide
    hide_reblog: false,

    // Hide replies toots. Default: don't hide
    hide_replies: false,

    // Hide preview card if toot contains a link, photo or video from a URL. Default: don't hide
    hide_preview_link: false,

    // Hide custom emojis available on the server. Default: don't hide
    hide_emojos: false,

    // Converts Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag. Ddefault: don't apply
    markdown_blockquote: false,

    // Hide replies, boosts and favourites toots counter. Default: don't hide
    hide_counter_bar: false,

    // Limit the text content to a maximum number of lines. Default: 0 (unlimited)
    text_max_lines: "0",

    // Customize the text of the link pointing to the Mastodon page (appears after the last toot)
    link_see_more: "See more posts at Mastodon",
  });
});

/**
 * Set all variables with customized values or use default ones
 * @param {object} params_ User customized values
 * Trigger main function to build the timeline
 */
const MastodonApi = function (params_) {
  this.CONTAINER_BODY_ID = params_.container_body_id || "mt-body";
  this.SPINNER_CLASS = params_.spinner_class || "loading-spinner";
  this.DEFAULT_THEME = params_.default_theme || "auto";
  this.INSTANCE_URL = params_.instance_url;
  this.USER_ID = params_.user_id || "";
  this.PROFILE_NAME = this.USER_ID ? params_.profile_name : "";
  this.TIMELINE_TYPE = params_.timeline_type || "local";
  this.HASHTAG_NAME = params_.hashtag_name || "";
  this.TOOTS_LIMIT = params_.toots_limit || "20";
  this.HIDE_UNLISTED =
    typeof params_.hide_unlisted !== "undefined"
      ? params_.hide_unlisted
      : false;
  this.HIDE_REBLOG =
    typeof params_.hide_reblog !== "undefined" ? params_.hide_reblog : false;
  this.HIDE_REPLIES =
    typeof params_.hide_replies !== "undefined" ? params_.hide_replies : false;
  this.HIDE_PREVIEW_LINK =
    typeof params_.hide_preview_link !== "undefined"
      ? params_.hide_preview_link
      : false;
  this.HIDE_EMOJOS =
    typeof params_.hide_emojos !== "undefined" ? params_.hide_emojos : false;
  this.MARKDOWN_BLOCKQUOTE =
    typeof params_.markdown_blockquote !== "undefined"
      ? params_.markdown_blockquote
      : false;
  this.HIDE_COUNTER_BAR =
    params_.hide_counter_bar !== "undefined" ? params_.hide_counter_bar : false;
  this.TEXT_MAX_LINES = params_.text_max_lines || "0";
  this.LINK_SEE_MORE = params_.link_see_more;
  this.FETCHED_DATA = {};

  this.mtBodyContainer = document.getElementById(this.CONTAINER_BODY_ID);

  this.buildTimeline();
};

/**
 * Trigger functions and construct timeline
 */
MastodonApi.prototype.buildTimeline = async function () {
  // Apply color theme
  this.setTheme();

  // Get server data
  await this.getTimelineData();

  // Empty the <div> container
  this.mtBodyContainer.innerHTML = "";

  for (let i in this.FETCHED_DATA.timeline) {
    // First filter (Public / Unlisted)
    if (
      this.FETCHED_DATA.timeline[i].visibility == "public" ||
      (!this.HIDE_UNLISTED &&
        this.FETCHED_DATA.timeline[i].visibility == "unlisted")
    ) {
      // Second filter (Reblog / Replies)
      if (
        (this.HIDE_REBLOG && this.FETCHED_DATA.timeline[i].reblog) ||
        (this.HIDE_REPLIES && this.FETCHED_DATA.timeline[i].in_reply_to_id)
      ) {
        // Nothing here (Don't append toots)
      } else {
        // Append toots
        this.appendToot(this.FETCHED_DATA.timeline[i], Number(i));
      }
    }
  }

  // Check if there are toots in the container (due to filters applied)
  if (this.mtBodyContainer.innerHTML === "") {
    this.mtBodyContainer.setAttribute("role", "none");
    this.mtBodyContainer.innerHTML =
      '<div class="mt-error"><span class="mt-error-icon">📭</span><br/><strong>Sorry, no toots to show</strong><br/><div class="mt-error-message">Got ' +
      this.FETCHED_DATA.timeline.length +
      ' toots from the server. <br/>This may be due to an incorrect configuration in the parameters or to filters applied to hide certains type of toots.</div></div>';
  } else {
    // Insert link after last toot to visit Mastodon page
    if (this.LINK_SEE_MORE) {
      let linkSeeMorePath = "";
      if (this.TIMELINE_TYPE === "profile") {
        linkSeeMorePath = this.PROFILE_NAME;
      } else if (this.TIMELINE_TYPE === "hashtag") {
        linkSeeMorePath = "tags/" + this.HASHTAG_NAME;
      } else if (this.TIMELINE_TYPE === "local") {
        linkSeeMorePath = "public/local";
      }
      const linkSeeMore =
        '<div class="mt-footer"><a href="' +
        this.INSTANCE_URL +
        "/" +
        this.escapeHtml(linkSeeMorePath) +
        '" target="_blank" rel="nofollow noopener noreferrer">' +
        this.LINK_SEE_MORE +
        "</a></div>";
      this.mtBodyContainer.parentNode.insertAdjacentHTML(
        "beforeend",
        linkSeeMore
      );
    }

    // Control loading spinners
    this.manageSpinner();
  }

  // Toot interactions
  this.mtBodyContainer.addEventListener("click", function (e) {
    // Check if toot cointainer was clicked
    if (
      e.target.localName == "article" ||
      e.target.offsetParent?.localName == "article" ||
      e.target.localName == "img"
    ) {
      openTootURL(e);
    }
    // Check if Show More/Less button was clicked
    if (e.target.localName == "button" && e.target.className == "spoiler-btn") {
      toogleSpoiler(e);
    }
  });
  this.mtBodyContainer.addEventListener("keydown", function (e) {
    // Check if Enter key was pressed with focus in an article
    if (e.key === "Enter" && e.target.localName == "article") {
      openTootURL(e);
    }
  });

  /**
   * Open toot in a new page avoiding any other natural link
   * @param {event} e User interaction trigger
   */
  const openTootURL = function (e) {
    const urlToot = e.target.closest(".mt-toot").dataset.location;
    if (
      e.target.localName !== "a" &&
      e.target.localName !== "span" &&
      e.target.localName !== "button" &&
      e.target.localName !== "time" &&
      e.target.className !== "mt-toot-preview-noImage" &&
      e.target.parentNode.className !== "mt-toot-avatar-image-big" &&
      e.target.parentNode.className !== "mt-toot-avatar-image-small" &&
      e.target.parentNode.className !== "mt-toot-preview-image" &&
      urlToot
    ) {
      window.open(urlToot, "_blank", "noopener");
    }
  };

  /**
   * Spoiler button
   * @param {event} e User interaction trigger
   */
  const toogleSpoiler = function (e) {
    const nextSibling = e.target.nextSibling;
    if (nextSibling.localName === "img") {
      e.target.parentNode.classList.remove("mt-toot-media-spoiler");
      e.target.style.display = "none";
    } else if (
      nextSibling.classList.contains("spoiler-text-hidden") ||
      nextSibling.classList.contains("spoiler-text-visible")
    ) {
      if (e.target.textContent == "Show more") {
        nextSibling.classList.remove("spoiler-text-hidden");
        nextSibling.classList.add("spoiler-text-visible");
        e.target.setAttribute("aria-expanded", "true");
        e.target.textContent = "Show less";
      } else {
        nextSibling.classList.remove("spoiler-text-visible");
        nextSibling.classList.add("spoiler-text-hidden");
        e.target.setAttribute("aria-expanded", "false");
        e.target.textContent = "Show more";
      }
    }
  };
};

/**
 * Set the theme style chosen by the user or by the browser/OS
 */
MastodonApi.prototype.setTheme = function () {
  /**
   * Set the theme value in the <html> tag using the attribute "data-theme"
   * @param {string} theme Type of theme to apply: dark or light
   */
  const setTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  };

  if (this.DEFAULT_THEME === "auto") {
    let systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme.matches ? setTheme("dark") : setTheme("light");
    // Update the theme if user change browser/OS preference
    systemTheme.addEventListener("change", (e) => {
      e.matches ? setTheme("dark") : setTheme("light");
    });
  } else {
    setTheme(this.DEFAULT_THEME);
  }
};

/**
 * Requests to the server to get all the data
 */
MastodonApi.prototype.getTimelineData = async function () {
  return new Promise((resolve, reject) => {
    /**
     * Fetch data from server
     * @param {string} url address to fetch
     * @returns {object} List of objects
     */
    async function fetchData(url) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch the following URL: " +
            url +
            "<hr>" +
            "Error status: " +
            response.status +
            "<hr>" +
            "Error message: " +
            response.statusText
        );
      }

      const data = await response.json();
      return data;
    }

    // URLs to fetch
    let urls = {};
    if (this.TIMELINE_TYPE === "profile") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/accounts/${this.USER_ID}/statuses?limit=${this.TOOTS_LIMIT}`;
    } else if (this.TIMELINE_TYPE === "hashtag") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/timelines/tag/${this.HASHTAG_NAME}?limit=${this.TOOTS_LIMIT}`;
    } else if (this.TIMELINE_TYPE === "local") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/timelines/public?local=true&limit=${this.TOOTS_LIMIT}`;
    }
    if (!this.HIDE_EMOJOS) {
      urls.emojos = this.INSTANCE_URL + "/api/v1/custom_emojis";
    }

    const urlsPromises = Object.entries(urls).map(([key, url]) => {
      return fetchData(url)
        .then((data) => ({ [key]: data }))
        .catch((error) => {
          reject(new Error("Something went wrong fetching data"));
          this.mtBodyContainer.innerHTML =
            '<div class="mt-error"><span class="mt-error-icon">❌</span><br/><strong>Sorry, request failed:</strong><br/><div class="mt-error-message">' +
            error.message +
            "</div></div>";
          this.mtBodyContainer.setAttribute("role", "none");
          return { [key]: [] };
        });
    });

    // Fetch all urls simultaneously
    Promise.all(urlsPromises).then((dataObjects) => {
      this.FETCHED_DATA = dataObjects.reduce((result, dataItem) => {
        return { ...result, ...dataItem };
      }, {});

      // console.log("Timeline data fetched: ", this.FETCHED_DATA);
      resolve();
    });
  });
};

/**
 * Inner function to add each toot in timeline container
 * @param {object} c Toot content
 * @param {number} i Index of toot
 */
MastodonApi.prototype.appendToot = function (c, i) {
  this.mtBodyContainer.insertAdjacentHTML("beforeend", this.assambleToot(c, i));
};

/**
 * Build toot structure
 * @param {object} c Toot content
 * @param {number} i Index of toot
 */
MastodonApi.prototype.assambleToot = function (c, i) {
  let avatar,
    user,
    userName,
    url,
    date,
    formattedDate,
    favoritesCount,
    reblogCount,
    repliesCount;

  if (c.reblog) {
    // BOOSTED toot
    // Toot url
    url = c.reblog.url;

    // Boosted avatar
    avatar =
      '<a href="' +
      c.reblog.account.url +
      '" class="mt-toot-avatar" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-toot-avatar-boosted">' +
      '<div class="mt-toot-avatar-image-big loading-spinner">' +
      '<img src="' +
      c.reblog.account.avatar +
      '" alt="' +
      this.escapeHtml(c.reblog.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      '<div class="mt-toot-avatar-image-small">' +
      '<img src="' +
      c.account.avatar +
      '" alt="' +
      this.escapeHtml(c.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      "</div>" +
      "</a>";

    // User name and url
    userName = this.showEmojos(
      c.reblog.account.display_name
        ? c.reblog.account.display_name
        : c.reblog.account.username,
      this.FETCHED_DATA.emojos
    );
    user =
      '<div class="mt-toot-header-user">' +
      '<a href="' +
      c.reblog.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      userName +
      '<span class="visually-hidden"> account</span>' +
      "</a>" +
      "</div>";

    // Date
    date = c.reblog.created_at;

    // Counter bar
    repliesCount = c.reblog.replies_count;
    reblogCount = c.reblog.reblogs_count;
    favoritesCount = c.reblog.favourites_count;
  } else {
    // STANDARD toot
    // Toot url
    url = c.url;

    // Avatar
    avatar =
      '<a href="' +
      c.account.url +
      '" class="mt-toot-avatar" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-toot-avatar-standard">' +
      '<div class="mt-toot-avatar-image-big loading-spinner">' +
      '<img src="' +
      c.account.avatar +
      '" alt="' +
      this.escapeHtml(c.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      "</div>" +
      "</a>";

    // User name and url
    userName = this.showEmojos(
      c.account.display_name ? c.account.display_name : c.account.username,
      this.FETCHED_DATA.emojos
    );
    user =
      '<div class="mt-toot-header-user">' +
      '<a href="' +
      c.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      userName +
      '<span class="visually-hidden"> account</span>' +
      "</a>" +
      "</div>";

    // Date
    date = c.created_at;

    // Counter bar
    repliesCount = c.replies_count;
    reblogCount = c.reblogs_count;
    favoritesCount = c.favourites_count;
  }

  // Date
  formattedDate = this.formatDate(date);
  const timestamp =
    '<div class="mt-toot-header-date">' +
    '<a href="' +
    url +
    '" rel="nofollow noopener noreferrer" target="_blank">' +
    '<time datetime="' +
    date +
    '">' +
    formattedDate +
    "</time>" +
    "</a>" +
    "</div>";

  // Main text
  let text_css = "";
  if (this.TEXT_MAX_LINES !== "0") {
    text_css = "truncate";
    document.documentElement.style.setProperty(
      "--text-max-lines",
      this.TEXT_MAX_LINES
    );
  }

  let content = "";
  if (c.spoiler_text !== "") {
    content =
      '<div class="mt-toot-text">' +
      c.spoiler_text +
      ' <button type="button" class="spoiler-btn" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatTootText(c.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text !== ""
  ) {
    content =
      '<div class="mt-toot-text">' +
      c.reblog.spoiler_text +
      ' <button type="button" class="spoiler-btn" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatTootText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text === ""
  ) {
    content =
      '<div class="mt-toot-text' +
      text_css +
      '">' +
      '<div class="mt-toot-text-wrapper">' +
      this.formatTootText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else {
    content =
      '<div class="mt-toot-text' +
      text_css +
      '">' +
      '<div class="mt-toot-text-wrapper">' +
      this.formatTootText(c.content) +
      "</div>" +
      "</div>";
  }

  // Media attachments
  let media = [];
  if (c.media_attachments.length > 0) {
    for (let picid in c.media_attachments) {
      media.push(this.placeMedias(c.media_attachments[picid], c.sensitive));
    }
  }
  if (c.reblog && c.reblog.media_attachments.length > 0) {
    for (let picid in c.reblog.media_attachments) {
      media.push(
        this.placeMedias(c.reblog.media_attachments[picid], c.reblog.sensitive)
      );
    }
  }

  // Preview link
  let previewLink = "";
  if (!this.HIDE_PREVIEW_LINK && c.card) {
    previewLink = this.placePreviewLink(c.card);
  }

  // Poll
  let poll = "";
  if (c.poll) {
    let pollOption = "";
    for (let i in c.poll.options) {
      pollOption += "<li>" + c.poll.options[i].title + "</li>";
    }
    poll =
      '<div class="mt-toot-poll ' +
      (c.poll.expired ? "mt-toot-poll-expired" : "") +
      '">' +
      "<ul>" +
      pollOption +
      "</ul>" +
      "</div>";
  }

  // Counter bar
  let counterBar = "";
  if (!this.HIDE_COUNTER_BAR) {
    const repliesTag =
      '<div class="mt-toot-counter-bar-replies">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="M774.913-185.869V-356q0-56.609-35.891-92.5-35.892-35.891-92.5-35.891H258.045L411.435-331l-56 56.566L105.869-524l249.566-249.566 56 56.566-153.39 153.391h388.477q88.957 0 148.566 59.609 59.608 59.609 59.608 148v170.131h-79.783Z"></path></svg>' +
      repliesCount +
      "</div>";

    const reblogTag =
      '<div class="mt-toot-counter-bar-reblog">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="M276.043-65.304 105.869-236.043l170.174-170.175 52.74 54.175-78.652 78.652h449.304v-160h75.261v235.261H250.131l78.652 78.087-52.74 54.74Zm-90.174-457.348v-235.261h524.565L631.782-836l52.74-54.74L854.696-720 684.522-549.26 631.782-604l78.652-78.652H261.13v160h-75.261Z"></path></svg>' +
      reblogCount +
      "</div>";

    const favoritesTag =
      '<div class="mt-toot-counter-bar-favorites">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="m330.955-216.328 149.066-89 149.066 90.023-40.305-168.391 131.217-114.347-172.956-14.87L480-671.869l-67.043 158.521-172.956 14.305 131.427 113.796-40.473 168.919ZM212.086-50.608l70.652-305.305L45.52-561.305l312.645-26.579L480-876.176l121.835 288.292 312.645 26.579-237.218 205.392 71.217 305.306L480-213.173 212.086-50.607ZM480-433.87Z"></path></svg>' +
      favoritesCount +
      "</div>";

    counterBar =
      '<div class="mt-toot-counter-bar">' +
      repliesTag +
      reblogTag +
      favoritesTag +
      "</div>";
  }

  // Add all to main toot container
  const toot =
    '<article class="mt-toot" aria-posinset="' +
    (i + 1) +
    '" aria-setsize="' +
    this.TOOTS_LIMIT +
    '" data-location="' +
    url +
    '" tabindex="0">' +
    '<div class="mt-toot-header">' +
    avatar +
    user +
    timestamp +
    "</div>" +
    content +
    media.join("") +
    previewLink +
    poll +
    counterBar +
    "</article>";

  return toot;
};

/**
 * Handle text changes made to toots
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.formatTootText = function (c) {
  let content = c;

  // Format hashtags and mentions
  content = this.addTarget2hashtagMention(content);

  // Convert emojos shortcode into images
  if (!this.HIDE_EMOJOS) {
    content = this.showEmojos(content, this.FETCHED_DATA.emojos);
  }

  // Convert markdown styles into HTML
  if (this.MARKDOWN_BLOCKQUOTE) {
    content = this.replaceHTMLtag(
      content,
      "<p>&gt;",
      "</p>",
      "<blockquote><p>",
      "</p></blockquote>"
    );
  }

  return content;
};

/**
 * Add target="_blank" to all #hashtags and @mentions in the toot
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.addTarget2hashtagMention = function (c) {
  let content = c.replaceAll('rel="tag"', 'rel="tag" target="_blank"');
  content = content.replaceAll(
    'class="u-url mention"',
    'class="u-url mention" target="_blank"'
  );

  return content;
};

/**
 * Find all custom emojis shortcode and replace by image
 * @param {string} c Text content
 * @param {array} e List with all custom emojis
 * @returns {string} Text content modified
 */
MastodonApi.prototype.showEmojos = function (c, e) {
  if (c.includes(":")) {
    for (const emojo of e) {
      const regex = new RegExp(`\\:${emojo.shortcode}\\:`, "g");
      c = c.replace(
        regex,
        `<img src="${emojo.url}" class="custom-emoji" alt="Emoji ${emojo.shortcode}" />`
      );
    }

    return c;
  } else {
    return c;
  }
};

/**
 * Find all start/end <tags> and replace them by another start/end <tags>
 * @param {string} c Text content
 * @param {string} initialTagOpen Start HTML tag to replace
 * @param {string} initialTagClose End HTML tag to replace
 * @param {string} replacedTagOpen New start HTML tag
 * @param {string} replacedTagClose New end HTML tag
 * @returns {string} Text in HTML format
 */
MastodonApi.prototype.replaceHTMLtag = function (
  c,
  initialTagOpen,
  initialTagClose,
  replacedTagOpen,
  replacedTagClose
) {
  if (c.includes(initialTagOpen)) {
    const regex = new RegExp(initialTagOpen + "(.*?)" + initialTagClose, "gi");

    return c.replace(regex, replacedTagOpen + "$1" + replacedTagClose);
  } else {
    return c;
  }
};

/**
 * Place media
 * @param {object} m Media content
 * @param {boolean} s Spoiler/Sensitive status
 * @returns {string} Media in HTML format
 */
MastodonApi.prototype.placeMedias = function (m, s) {
  const spoiler = s || false;
  const pic =
    '<div class="mt-toot-media img-ratio14_7 ' +
    (spoiler ? "mt-toot-media-spoiler " : "") +
    this.SPINNER_CLASS +
    '">' +
    (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
    '<img src="' +
    m.preview_url +
    '" alt="' +
    (m.description ? this.escapeHtml(m.description) : "") +
    '" loading="lazy" />' +
    "</div>";

  return pic;
};

/**
 * Place preview link
 * @param {object} c Preview link content
 * @returns {string} Preview link in HTML format
 */
MastodonApi.prototype.placePreviewLink = function (c) {
  const card =
    '<a href="' +
    c.url +
    '" class="mt-toot-preview" target="_blank" rel="noopener noreferrer">' +
    (c.image
      ? '<div class="mt-toot-preview-image ' +
        this.SPINNER_CLASS +
        '"><img src="' +
        c.image +
        '" alt="' +
        this.escapeHtml(c.image_description) +
        '" loading="lazy" /></div>'
      : '<div class="mt-toot-preview-noImage">📄</div>') +
    "</div>" +
    '<div class="mt-toot-preview-content">' +
    (c.provider_name
      ? '<span class="mt-toot-preview-provider">' +
        this.parseHTMLstring(c.provider_name) +
        "</span>"
      : "") +
    '<span class="mt-toot-preview-title">' +
    c.title +
    "</span>" +
    (c.author_name
      ? '<span class="mt-toot-preview-author">' +
        this.parseHTMLstring(c.author_name) +
        "</span>"
      : "") +
    "</div>" +
    "</a>";

  return card;
};

/**
 * Format date
 * @param {string} d Date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns {string} Date formated (MM DD, YYYY)
 */
MastodonApi.prototype.formatDate = function (d) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date = new Date(d);

  const displayDate =
    monthNames[date.getMonth()] +
    " " +
    date.getDate() +
    ", " +
    date.getFullYear();

  return displayDate;
};

/**
 * Parse HTML string
 * @param {string} s HTML string
 * @returns {string} Plain text
 */
MastodonApi.prototype.parseHTMLstring = function (s) {
  const parser = new DOMParser();
  const txt = parser.parseFromString(s, "text/html");
  return txt.body.textContent;
};

/**
 * Escape quotes and other special characters, to make them safe to add
 * to HTML content and attributes as plain text
 * @param {string} s String
 * @returns {string} String
 */
MastodonApi.prototype.escapeHtml = function (s) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

/**
 * Add/Remove event listener for loading spinner
 */
MastodonApi.prototype.manageSpinner = function () {
  // Remove CSS class to container and listener to images
  const spinnerCSS = this.SPINNER_CLASS;
  const removeSpinner = function () {
    this.parentNode.classList.remove(spinnerCSS);
    this.removeEventListener("load", removeSpinner);
    this.removeEventListener("error", removeSpinner);
  };

  // Add listener to images
  this.mtBodyContainer
    .querySelectorAll(`.${this.SPINNER_CLASS} > img`)
    .forEach((e) => {
      e.addEventListener("load", removeSpinner);
      e.addEventListener("error", removeSpinner);
    });
};
