/**
 * Mastodon embed timeline
 * @author idotj
 * @version 4.7.0
 * @url https://gitlab.com/idotj/mastodon-embed-timeline
 * @license GNU AGPLv3
 */
"use strict";

export class Init {
  constructor(customSettings = {}) {
    this.defaultSettings = {
      mtContainerId: "mt-container",
      instanceUrl: "https://mastodon.social",
      timelineType: "local",
      userId: "",
      profileName: "",
      hashtagName: "",
      spinnerClass: "mt-loading-spinner",
      defaultTheme: "auto",
      maxNbPostFetch: "20",
      maxNbPostShow: "20",
      dateFormatLocale: "en-GB",
      dateFormatOptions: {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
      hideUnlisted: false,
      hideReblog: false,
      hideReplies: false,
      hidePinnedPosts: false,
      hideUserAccount: false,
      txtMaxLines: "",
      filterByLanguage: "",
      btnShowMore: "SHOW MORE",
      btnShowLess: "SHOW LESS",
      markdownBlockquote: false,
      hideEmojos: false,
      btnShowContent: "SHOW CONTENT",
      hideVideoPreview: false,
      btnPlayVideoTxt: "Load and play video",
      hidePreviewLink: false,
      previewMaxLines: "",
      hideCounterBar: false,
      disableCarousel: false,
      carouselCloseTxt: "Close carousel",
      carouselPrevTxt: "Previous media item",
      carouselNextTxt: "Next media item",
      btnSeeMore: "See more posts at Mastodon",
      btnReload: "Refresh",
      insistSearchContainer: false,
      insistSearchContainerTime: "3000",
    };

    this.mtSettings = { ...this.defaultSettings, ...customSettings };

    this.#checkMaxNbPost();

    this.linkHeader = {};
    this.mtContainerNode = "";
    this.mtBodyNode = "";
    this.fetchedData = {};

    this.#onDOMContentLoaded(() => {
      this.#getContainerNode();
    });
  }

  /**
   * Verify that the values of posts fetched and showed are consistent
   */
  #checkMaxNbPost() {
    if (
      Number(this.mtSettings.maxNbPostShow) >
      Number(this.mtSettings.maxNbPostFetch)
    ) {
      console.error(
        `Please check your settings! The maximum number of posts to show is bigger than the maximum number of posts to fetch. Changing the value of "maxNbPostFetch" to: ${this.mtSettings.maxNbPostShow}`
      );
      this.mtSettings.maxNbPostFetch = this.mtSettings.maxNbPostShow;
    }
  }

  /**
   * Trigger callback when DOM loaded or completed
   * @param {Function} c Callback executed
   */
  #onDOMContentLoaded(c) {
    if (typeof document !== "undefined" && document.readyState === "complete") {
      c();
    } else if (
      typeof document !== "undefined" &&
      document.readyState !== "complete"
    ) {
      document.addEventListener("DOMContentLoaded", c());
    }
  }

  /**
   * Find main container in DOM before building the timeline
   */
  #getContainerNode() {
    const assignContainerNode = () => {
      this.mtContainerNode = document.getElementById(
        this.mtSettings.mtContainerId
      );
      this.mtBodyNode =
        this.mtContainerNode.getElementsByClassName("mt-body")[0];
      this.#loadColorTheme();
      this.#buildTimeline("newTimeline");
    };

    // Some frameworks render the DOM in deferred way and need some extra time
    if (this.mtSettings.insistSearchContainer) {
      const startCheck = performance.now();
      const findContainerNode = () => {
        // Check if the container is ready in DOM
        if (document.getElementById(this.mtSettings.mtContainerId)) {
          assignContainerNode();
        } else {
          // If the container is not found, check again
          const currentCheck = performance.now();
          if (
            currentCheck - startCheck <
            this.mtSettings.insistSearchContainerTime
          ) {
            requestAnimationFrame(findContainerNode);
          } else {
            console.error(
              `Impossible to find the <div> container with id: "${
                this.mtSettings.mtContainerId
              }" after several attempts for ${
                this.mtSettings.insistSearchContainerTime / 1000
              } seconds`
            );
          }
        }
      };
      findContainerNode();
    } else {
      if (document.getElementById(this.mtSettings.mtContainerId)) {
        assignContainerNode();
      } else {
        console.error(
          `Impossible to find the <div> container with id: "${this.mtSettings.mtContainerId}". Please try to add the option 'insistSearchContainer: true' when initializing the script`
        );
      }
    }
  }

  /**
   * Reload the timeline by fetching the lastest posts
   */
  mtUpdate() {
    this.#onDOMContentLoaded(() => {
      this.mtBodyNode.replaceChildren();
      this.mtBodyNode.insertAdjacentHTML(
        "afterbegin",
        '<div class="mt-loading-spinner"></div>'
      );
      this.#buildTimeline("updateTimeline");
    });
  }

  /**
   * Apply the color theme in the timeline
   * @param {String} themeType Type of color theme ('light' or 'dark')
   */
  mtColorTheme(themeType) {
    this.#onDOMContentLoaded(() => {
      this.mtContainerNode.setAttribute("data-theme", themeType);
    });
  }

  /**
   * Get the theme style chosen by the user or by the browser/OS
   */
  #loadColorTheme() {
    if (this.mtSettings.defaultTheme === "auto") {
      let systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
      systemTheme.matches
        ? this.mtColorTheme("dark")
        : this.mtColorTheme("light");
      // Update the theme if user change browser/OS preference
      systemTheme.addEventListener("change", (e) => {
        e.matches ? this.mtColorTheme("dark") : this.mtColorTheme("light");
      });
    } else {
      this.mtColorTheme(this.mtSettings.defaultTheme);
    }
  }

  /**
   * Requests to the server to collect all the data
   * @returns {Object} Data container
   */
  #getTimelineData() {
    return new Promise((resolve, reject) => {
      const instanceApiUrl = this.mtSettings.instanceUrl
        ? `${this.mtSettings.instanceUrl}/api/v1/`
        : this.#showError(
            "Please check your <strong>instanceUrl</strong> value",
            "⚠️"
          );

      const urls = this.#setUrls(instanceApiUrl);

      const urlsPromises = Object.entries(urls).map(([key, url]) => {
        return this.#fetchData(url, key)
          .then((data) => ({ [key]: data }))
          .catch((error) => {
            reject(
              new Error(`Something went wrong getting the timeline data.`)
            );
            this.#showError(error.message);
            return { [key]: [] };
          });
      });

      // Fetch all urls simultaneously
      Promise.all(urlsPromises).then(async (dataObjects) => {
        this.fetchedData = dataObjects.reduce((result, dataItem) => {
          return { ...result, ...dataItem };
        }, {});

        // Merge pinned posts with timeline posts
        if (
          !this.mtSettings.hidePinnedPosts &&
          this.fetchedData.pinned?.length !== undefined &&
          this.fetchedData.pinned.length !== 0
        ) {
          const pinnedPosts = this.fetchedData.pinned.map((obj) => ({
            ...obj,
            pinned: true,
          }));
          this.fetchedData.timeline = [
            ...pinnedPosts,
            ...this.fetchedData.timeline,
          ];
        }

        // Fetch more posts if maxNbPostFetch is not reached
        if (this.#isNbPostsFulfilled()) {
          resolve();
        } else {
          do {
            await this.#fetchMorePosts();
          } while (!this.#isNbPostsFulfilled() && this.linkHeader.next);
          resolve();
        }
      });
    });
  }

  /**
   * Set all urls before fetching the data
   * @param {String} Instance url api
   * @returns {Object}
   */
  #setUrls(i) {
    const {
      timelineType,
      userId,
      hashtagName,
      hideReblog,
      hideReplies,
      maxNbPostFetch,
      hidePinnedPosts,
      hideEmojos,
    } = this.mtSettings;

    const urls = {};

    switch (timelineType) {
      case "profile":
        if (!userId) {
          this.#showError(
            "Please check your <strong>userId</strong> value",
            "⚠️"
          );
          break;
        }
        urls.timeline = `${i}accounts/${userId}/statuses?limit=${maxNbPostFetch}`;
        if (!hidePinnedPosts) {
          urls.pinned = `${i}accounts/${userId}/statuses?pinned=true`;
        }
        break;

      case "hashtag":
        if (!hashtagName) {
          this.#showError(
            "Please check your <strong>hashtagName</strong> value",
            "⚠️"
          );
          break;
        }
        urls.timeline = `${i}timelines/tag/${hashtagName}?limit=${maxNbPostFetch}`;
        break;

      case "local":
        urls.timeline = `${i}timelines/public?local=true&limit=${maxNbPostFetch}`;
        break;

      default:
        this.#showError(
          "Please check your <strong>timelineType</strong> value",
          "⚠️"
        );
    }

    if (hideReblog) {
      urls.timeline += "&exclude_reblogs=true";
    }

    if (hideReplies) {
      urls.timeline += "&exclude_replies=true";
    }

    if (!hideEmojos) {
      urls.emojos = `${i}custom_emojis`;
    }

    return urls;
  }

  /**
   * Fetch data from server
   * @param {String} u Url address to fetch
   * @param {String} t Type of data to request
   * @returns {Array} List of objects
   */
  async #fetchData(u, t) {
    const response = await fetch(u);

    if (!response.ok) {
      throw new Error(`
        Failed to fetch the following Url:<br />${u}<hr />Error status: ${response.status}<hr />Error message: ${response.statusText}
        `);
    }

    const data = await response.json();

    // Get Link headers for pagination
    if (t === "timeline" && response.headers.get("Link")) {
      this.linkHeader = this.#parseLinkHeader(response.headers.get("Link"));
    }

    return data;
  }

  /**
   * Check if there are enough posts to reach the value of maxNbPostFetch
   * @returns {Boolean}
   */
  #isNbPostsFulfilled() {
    return (
      this.fetchedData.timeline.length >= Number(this.mtSettings.maxNbPostFetch)
    );
  }

  /**
   * Fetch extra posts
   */
  #fetchMorePosts() {
    return new Promise((resolve) => {
      if (this.linkHeader.next) {
        this.#fetchData(this.linkHeader.next, "timeline")
          .then((data) => {
            this.fetchedData.timeline = [...this.fetchedData.timeline, ...data];
            resolve();
          })
          .catch((error) => {
            reject(new Error(`Something went wrong fetching more posts.`));
            this.#showError(error.message);
            return { [key]: [] };
          });
      } else {
        resolve();
      }
    });
  }

  /**
   * Parse link header into an object
   * @param {String} l Link header
   * @returns {Object}
   */
  #parseLinkHeader(l) {
    const linkArray = l.split(", ").map((header) => header.split("; "));
    const linkMap = linkArray.map((header) => {
      const linkRel = header[1].replace(/"/g, "").replace("rel=", "");
      const linkURL = header[0].slice(1, -1);
      return [linkRel, linkURL];
    });
    return Object.fromEntries(linkMap);
  }

  /**
   * Filter all fetched posts and append them on the timeline
   * @param {String} t Type of build (new or reload)
   */
  async #buildTimeline(t) {
    await this.#getTimelineData();
    const { hideUnlisted, maxNbPostShow, filterByLanguage } = this.mtSettings;
    const posts = this.fetchedData.timeline;
    let nbPostToShow = 0;
    this.mtBodyNode.replaceChildren();

    const filteredPosts = posts.filter((post) => {
      const isPublicOrUnlisted =
        post.visibility === "public" ||
        (!hideUnlisted && post.visibility === "unlisted");
      const postLanguage =
        post.language || (post.reblog ? post.reblog.language : null);
      const matchesLanguage =
        filterByLanguage === "" || postLanguage === filterByLanguage;

      return isPublicOrUnlisted && matchesLanguage;
    });

    filteredPosts.forEach((post, index) => {
      if (index < maxNbPostShow) {
        this.#appendPost(post, index);
      }
    });

    // Check if there are posts to display or not
    if (this.mtBodyNode.innerHTML !== "") {
      if (t === "newTimeline") {
        this.#manageSpinner();
        this.#setCSSvariables();
        this.#addAriaSetsize(nbPostToShow);
        this.#addPostListener();
        if (this.mtSettings.btnSeeMore || this.mtSettings.btnReload)
          this.#buildFooter();
      } else if (t === "updateTimeline") {
        this.#manageSpinner();
      } else {
        this.#showError("The function buildTimeline() was expecting a param");
      }
    } else {
      const errorMessage = `No posts to show<hr />${
        posts?.length || 0
      } posts have been fetched from the server<hr />This may be due to an incorrect configuration with the parameters or with the filters applied (to hide certains type of posts)`;
      this.#showError(errorMessage, "📭");
    }
  }

  /**
   * Set the defined CSS variables
   */
  #setCSSvariables() {
    if (
      this.mtSettings.txtMaxLines !== "0" &&
      this.mtSettings.txtMaxLines.length !== 0
    ) {
      this.mtBodyNode.parentNode.style.setProperty(
        "--mt-txt-max-lines",
        this.mtSettings.txtMaxLines
      );
    }
    if (
      this.mtSettings.previewMaxLines !== "0" &&
      this.mtSettings.previewMaxLines.length !== 0
    ) {
      this.mtBodyNode.parentNode.style.setProperty(
        "--mt-preview-max-lines",
        this.mtSettings.previewMaxLines
      );
    }
  }

  /**
   * Add the attribute Aria-setsize to all posts
   * @param {Number} n The total number of posts showed in the timeline
   */
  #addAriaSetsize(n) {
    const articles = this.mtBodyNode.getElementsByTagName("article");

    for (let i = 0; i < n; i++) {
      articles[i].setAttribute("aria-setsize", n);
    }
  }

  /**
   * Add each post in the timeline container
   * @param {Object} c Post content
   * @param {Number} i Index of post
   */
  #appendPost(c, i) {
    this.mtBodyNode.insertAdjacentHTML("beforeend", this.#assamblePost(c, i));
  }

  /**
   * Build post structure
   * @param {Object} c Post content
   * @param {Number} i Index of post
   */
  #assamblePost(c, i) {
    const isReblog = Boolean(c.reblog);
    const post = isReblog ? c.reblog : c;
    const {
      url,
      created_at: date,
      replies_count,
      reblogs_count,
      favourites_count,
    } = post;
    const {
      avatar,
      url: accountUrl,
      username,
      display_name,
      emojis,
    } = post.account;

    // Avatar
    const avatarHTML =
      '<a href="' +
      accountUrl +
      '" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-post-avatar-' +
      (isReblog ? "boosted" : "standard") +
      '">' +
      '<div class="mt-post-avatar-image-big mt-loading-spinner">' +
      '<img src="' +
      avatar +
      '" alt="' +
      this.#escapeHTML(username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      (isReblog
        ? '<div class="mt-post-avatar-image-small">' +
          '<img src="' +
          c.account.avatar +
          '" alt="' +
          this.#escapeHTML(c.account.username) +
          ' avatar" loading="lazy" />' +
          "</div>"
        : "") +
      "</div>" +
      "</a>";

    // User
    const userNameFull =
      !this.mtSettings.hideEmojos && display_name
        ? this.#shortcode2Emojos(display_name, emojis)
        : display_name || username;

    const accountName = this.mtSettings.hideUserAccount
      ? ""
      : '<br /><span class="mt-post-header-user-account">@' +
        username +
        "@" +
        new URL(accountUrl).hostname +
        "</span>";

    const userHTML =
      '<div class="mt-post-header-user">' +
      '<a href="' +
      accountUrl +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      '<bdi class="mt-post-header-user-name">' +
      userNameFull +
      "</bdi>" +
      accountName +
      "</a>" +
      "</div>";

    // Date
    const formattedDate = this.#formatDate(date);
    const dateHTML =
      '<div class="mt-post-header-date">' +
      (c.pinned
        ? '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="mt-post-pinned" aria-hidden="true"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"></path></svg>'
        : "") +
      '<a href="' +
      url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      '<time datetime="' +
      date +
      '">' +
      formattedDate +
      "</time>" +
      (c.edited_at ? " *" : "") +
      "</a>" +
      "</div>";

    // Preview link
    const previewLinkHTML =
      !this.mtSettings.hidePreviewLink && (c.card || c.reblog?.card)
        ? this.#createPreviewLink(!isReblog ? c.card : c.reblog.card)
        : "";

    // Post text
    const hasTxtMaxLines = this.mtSettings.txtMaxLines !== "0";
    const txtTruncateCss =
      hasTxtMaxLines && this.mtSettings.txtMaxLines.length ? " truncate" : "";
    let postTxt = "";
    const textSource = post.spoiler_text ? post.spoiler_text : post.content;
    const spoilerContent =
      ' <button type="button" class="mt-btn-dark mt-btn-spoiler-txt" aria-expanded="false">' +
      this.mtSettings.btnShowMore +
      "</button>" +
      '<div class="spoiler-txt-hidden">' +
      this.#formatPostText(post.content) +
      previewLinkHTML +
      "</div>";

    if (textSource) {
      postTxt =
        '<div class="mt-post-txt' +
        txtTruncateCss +
        '">' +
        '<div class="mt-post-txt-wrapper">' +
        this.#formatPostText(textSource) +
        (post.spoiler_text ? spoilerContent : "") +
        "</div>" +
        "</div>";
    }

    // Media
    const media = [
      ...c.media_attachments,
      ...(c.reblog?.media_attachments || []),
    ]
      .map((attachment) => this.#createMedia(attachment, post.sensitive))
      .join("");

    const mediaHTML = media
      ? `<div class="mt-post-media-wrapper">${media}</div>`
      : "";

    // Poll
    const pollHTML = c.poll
      ? '<div class="mt-post-poll ' +
        (c.poll.expired ? "mt-post-poll-expired" : "") +
        '">' +
        "<ul>" +
        c.poll.options
          .map(function (opt) {
            return "<li>" + opt.title + "</li>";
          })
          .join("") +
        "</ul>" +
        "</div>"
      : "";

    // Counter bar
    const counterBarHTML = !this.mtSettings.hideCounterBar
      ? '<div class="mt-post-counter-bar">' +
        this.#counteBarItem("replies", replies_count) +
        this.#counteBarItem("reblog", reblogs_count) +
        this.#counteBarItem("favorites", favourites_count) +
        "</div>"
      : "";

    return (
      '<article class="mt-post" aria-posinset="' +
      (i + 1) +
      '" data-location="' +
      url +
      '" tabindex="0">' +
      '<div class="mt-post-header">' +
      avatarHTML +
      userHTML +
      dateHTML +
      "</div>" +
      postTxt +
      mediaHTML +
      pollHTML +
      (post.spoiler_text ? "" : previewLinkHTML) +
      counterBarHTML +
      "</article>"
    );
  }

  /**
   * Build counter bar items
   * @param {string} t Type of icon
   * @param {Number} i Counter
   */
  #counteBarItem(t, c) {
    const icons = {
      replies:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M774.913-185.869V-356q0-56.609-35.891-92.5-35.892-35.891-92.5-35.891H258.045L411.435-331l-56 56.566L105.869-524l249.566-249.566 56 56.566-153.39 153.391h388.477q88.957 0 148.566 59.609 59.608 59.609 59.608 148v170.131h-79.783Z"></path></svg>',
      reblog:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M276.043-65.304 105.869-236.043l170.174-170.175 52.74 54.175-78.652 78.652h449.304v-160h75.261v235.261H250.131l78.652 78.087-52.74 54.74Zm-90.174-457.348v-235.261h524.565L631.782-836l52.74-54.74L854.696-720 684.522-549.26 631.782-604l78.652-78.652H261.13v160h-75.261Z"></path></svg>',
      favorites:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="m330.955-216.328 149.066-89 149.066 90.023-40.305-168.391 131.217-114.347-172.956-14.87L480-671.869l-67.043 158.521-172.956 14.305 131.427 113.796-40.473 168.919ZM212.086-50.608l70.652-305.305L45.52-561.305l312.645-26.579L480-876.176l121.835 288.292 312.645 26.579-237.218 205.392 71.217 305.306L480-213.173 212.086-50.607ZM480-433.87Z"></path></svg>',
    };
    return `<div class="mt-post-counter-bar-${t}">${icons[t]}${c}</div>`;
  }

  /**
   * Sanitize an HTML string
   * (c) Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param {String} s The HTML string to sanitize
   * @param {Boolean} n If true, returns HTML nodes instead of a string
   * @return {String|NodeList} The sanitized string or nodes
   */
  #cleanHTML(s, n) {
    /**
     * Convert the string to an HTML document
     * @return {Node} An HTML document
     */
    function stringToHTML() {
      let parser = new DOMParser();
      let doc = parser.parseFromString(s, "text/html");
      return doc.body || document.createElement("body");
    }

    /**
     * Remove <script> elements
     * @param {Node} html The HTML
     */
    function removeScripts(html) {
      let scripts = html.querySelectorAll("script");
      for (let script of scripts) {
        script.remove();
      }
    }

    /**
     * Check if the attribute is potentially dangerous
     * @param {String} name The attribute name
     * @param {String} value The attribute value
     * @return {Boolean} If true, the attribute is potentially dangerous
     */
    function isPossiblyDangerous(name, value) {
      let val = value.replace(/\s+/g, "").toLowerCase();
      if (["src", "href", "xlink:href"].includes(name)) {
        if (val.includes("javascript:") || val.includes("data:")) return true;
      }
      if (name.startsWith("on")) return true;
    }

    /**
     * Remove potentially dangerous attributes from an element
     * @param {Node} elem The element
     */
    function removeAttributes(elem) {
      // Loop through each attribute
      // If it's dangerous, remove it
      let atts = elem.attributes;
      for (let { name, value } of atts) {
        if (!isPossiblyDangerous(name, value)) continue;
        elem.removeAttribute(name);
      }
    }

    /**
     * Remove dangerous stuff from the HTML document's nodes
     * @param {Node} html The HTML document
     */
    function clean(html) {
      let nodes = html.children;
      for (let node of nodes) {
        removeAttributes(node);
        clean(node);
      }
    }

    // Convert the string to HTML
    let html = stringToHTML();

    // Sanitize it
    removeScripts(html);
    clean(html);

    // If the user wants HTML nodes back, return them
    // Otherwise, pass a sanitized string back
    return n ? html.childNodes : html.innerHTML;
  }

  /**
   * Handle text changes made to posts
   * @param {String} c Text content
   * @returns {String} Text content modified
   */
  #formatPostText(c) {
    let content = c;

    // Sanitize string
    content = this.#cleanHTML(content, false);

    // Format hashtags and mentions
    content = this.#addTarget2hashtagMention(content);

    // Convert emojos shortcode into images
    if (!this.mtSettings.hideEmojos) {
      content = this.#shortcode2Emojos(content, this.fetchedData.emojos);
    }

    // Convert markdown styles into HTML
    if (this.mtSettings.markdownBlockquote) {
      content = this.#replaceHTMLtag(
        content,
        "<p>&gt;",
        "</p>",
        "<blockquote><p>",
        "</p></blockquote>"
      );
    }

    return content;
  }

  /**
   * Add target="_blank" to all #hashtags and @mentions in the post
   * @param {String} c Text content
   * @returns {String} Text content modified
   */
  #addTarget2hashtagMention(c) {
    let content = c.replaceAll('rel="tag"', 'rel="tag" target="_blank"');
    content = content.replaceAll(
      'class="u-url mention"',
      'class="u-url mention" target="_blank"'
    );

    return content;
  }

  /**
   * Find all start/end <tags> and replace them by another start/end <tags>
   * @param {String} c Text content
   * @param {String} initialTagOpen Start HTML tag to replace
   * @param {String} initialTagClose End HTML tag to replace
   * @param {String} replacedTagOpen New start HTML tag
   * @param {String} replacedTagClose New end HTML tag
   * @returns {String} Text in HTML format
   */
  #replaceHTMLtag(
    c,
    initialTagOpen,
    initialTagClose,
    replacedTagOpen,
    replacedTagClose
  ) {
    if (c.includes(initialTagOpen)) {
      const regex = new RegExp(
        initialTagOpen + "(.*?)" + initialTagClose,
        "gi"
      );

      return c.replace(regex, replacedTagOpen + "$1" + replacedTagClose);
    } else {
      return c;
    }
  }

  /**
   * Escape quotes and other special characters, to make them safe to add
   * to HTML content and attributes as plain text
   * @param {String} s String
   * @returns {String} String
   */
  #escapeHTML(s) {
    return (s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /**
   * Find all custom emojis shortcode and replace by image
   * @param {String} c Text content
   * @param {Array} e List with all custom emojis
   * @returns {String} Text content modified
   */
  #shortcode2Emojos(c, e) {
    if (c.includes(":")) {
      for (const emojo of e) {
        const regex = new RegExp(`\\:${emojo.shortcode}\\:`, "g");
        c = c.replace(
          regex,
          `<img src="${emojo.url}" class="mt-custom-emoji" alt="Emoji ${emojo.shortcode}" />`
        );
      }
      return c;
    } else {
      return c;
    }
  }

  /**
   * Format date
   * @param {String} d Date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @returns {String} Date formated
   */
  #formatDate(d) {
    const originalDate = new Date(d);
    const formattedDate = new Intl.DateTimeFormat(
      this.mtSettings.dateFormatLocale,
      this.mtSettings.dateFormatOptions
    ).format(originalDate);
    return formattedDate;
  }

  /**
   * Create media element
   * @param {Object} m Media content
   * @param {Boolean} s Sensitive/spoiler status
   * @returns {String} Media in HTML format
   */
  #createMedia(m, s = false) {
    const { type, url, preview_url, description, meta } = m;
    const { original, small } = meta;
    const { spinnerClass, btnShowContent, btnPlayVideoTxt, hideVideoPreview } =
      this.mtSettings;
    const spoilerBtns =
      '<button class="mt-btn-dark mt-btn-spoiler-media mt-btn-spoiler-media-hide">' +
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="icon icon-eye-slash" aria-hidden="true">' +
      '<path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"></path></svg>' +
      '</button><button class="mt-btn-dark mt-btn-spoiler-media mt-btn-spoiler-media-show">' +
      btnShowContent +
      "</button>";

    const commonAttributes =
      ' class="mt-post-media ' +
      (s ? "mt-post-media-spoiler " : "") +
      (spinnerClass || "") +
      '" data-media-type="' +
      type +
      '" data-media-url-hd="' +
      url +
      '"' +
      (description
        ? ' data-media-alt-txt="' + this.#escapeHTML(description) + '"'
        : "") +
      ' data-media-width-hd="' +
      original.width +
      '" data-media-height-hd="' +
      original.height +
      '"' +
      ' style="padding-top: calc(100%/' +
      small?.aspect +
      ')">';

    if (type === "image") {
      return (
        "<div" +
        commonAttributes +
        (s ? spoilerBtns : "") +
        '<img src="' +
        preview_url +
        '" alt="' +
        (description ? this.#escapeHTML(description) : "") +
        '" loading="lazy" /></div>'
      );
    }

    if (type === "audio") {
      return (
        '<div class="mt-post-media ' +
        (s ? "mt-post-media-spoiler " : "") +
        (preview_url ? spinnerClass : "") +
        '" data-media-type="audio">' +
        (s ? spoilerBtns : "") +
        '<audio controls src="' +
        url +
        '"></audio>' +
        (preview_url
          ? '<img src="' +
            preview_url +
            '" alt="' +
            (description ? this.#escapeHTML(description) : "") +
            '" loading="lazy" />'
          : "") +
        "</div>"
      );
    }

    if (type === "video" || type === "gifv") {
      if (!hideVideoPreview) {
        return (
          "<div" +
          commonAttributes +
          (s ? spoilerBtns : "") +
          '<img src="' +
          preview_url +
          '" alt="' +
          (description ? this.#escapeHTML(description) : "") +
          '" loading="lazy" />' +
          '<button class="mt-btn-play" title="' +
          btnPlayVideoTxt +
          '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14">' +
          '<path d="M9.5 7l-9 6.3V.7z"/></svg></button></div>'
        );
      }
      return (
        "<div" +
        commonAttributes +
        (s ? spoilerBtns : "") +
        '<video controls src="' +
        url +
        '" loop></video></div>'
      );
    }

    return "";
  }

  /**
   * Open a dialog/modal with the styles of Mastodon timeline
   * @param {String} i Dialog Id name
   * @param {String} c Dialog HTML content
   */
  #openDialog(i, c) {
    let dialog = document.createElement("dialog");
    dialog.id = i;
    dialog.classList.add("mt-dialog");
    dialog.dataset.theme = this.mtContainerNode.getAttribute("data-theme");
    dialog.innerHTML = c;
    document.body.prepend(dialog);
    dialog.showModal();
    dialog.addEventListener("close", () => {
      document.body.removeChild(dialog);
    });
  }

  /**
   * Build a carousel/lightbox with the media content in the post clicked
   * @param {Event} e User interaction trigger
   */
  #showCarousel(e) {
    // List all medias in the post and remove sensitive/spoiler medias
    const mediaSiblings = Array.from(
      e.target.parentNode.parentNode.children
    ).filter((element) => !element.classList.contains("mt-post-media-spoiler"));
    const mediaClickedIndex = mediaSiblings.indexOf(e.target.parentNode) + 1;

    // Build media element and wrapper
    let mediaItems = [];
    mediaSiblings.forEach((sibling, i) => {
      let mediaElement = "";
      if (
        sibling.getAttribute("data-media-type") === "gifv" ||
        sibling.getAttribute("data-media-type") === "video"
      ) {
        mediaElement = `
        <video controls src="${sibling.getAttribute(
          "data-media-url-hd"
        )}" width="${sibling.getAttribute(
          "data-media-width-hd"
        )}" height="${sibling.getAttribute(
          "data-media-height-hd"
        )}" class="mt-carousel-media" style="max-width:${sibling.getAttribute(
          "data-media-width-hd"
        )}px; max-height:${sibling.getAttribute(
          "data-media-height-hd"
        )}px" loop>
        </video>
        `;
      } else {
        mediaElement = `
        <img src="${sibling.getAttribute(
          "data-media-url-hd"
        )}" width="${sibling.getAttribute(
          "data-media-width-hd"
        )}" height="${sibling.getAttribute(
          "data-media-height-hd"
        )}" class="mt-carousel-media mt-loading-spinner" alt="${sibling.getAttribute(
          "data-media-alt-txt"
        )}" style="max-width:${sibling.getAttribute(
          "data-media-width-hd"
        )}px; max-height:${sibling.getAttribute(
          "data-media-height-hd"
        )}px" dragabble="false" />
        `;
      }

      const mediaWrapper = `
      <li class="mt-carousel-item">
        <div id="mt-carousel-${
          i + 1
        }" class="mt-carousel-media-wrapper" data-media-type="${sibling.getAttribute(
        "data-media-type"
      )}">
          ${mediaElement}
        </div>
      </li>
      `;

      mediaItems.push(mediaWrapper);
    });

    // Build carousel
    const carouselHTML = `
    <div class="mt-carousel-header">
      <form method="dialog">
        <button id="mt-carousel-close" class="mt-btn-dark" title="${
          this.mtSettings.carouselCloseTxt
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z" fill="var(--mt-color-content-txt)"/>
          </svg>
        </button>
      </form>
    </div>

    <div class="mt-carousel-body">
      <ul id="mt-carousel-scroll" class="mt-carousel-scroll">
        ${mediaItems.join("")}
      </ul>
    </div>

    <button id="mt-carousel-prev" class="mt-carousel-prev" title="${
      this.mtSettings.carouselPrevTxt
    }" ${mediaClickedIndex === 1 ? "hidden" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" aria-hidden="true">
        <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" fill="var(--mt-color-content-txt)"></path>
      </svg>
    </button>

    <button id="mt-carousel-next" class="mt-carousel-next" title="${
      this.mtSettings.carouselNextTxt
    }" ${mediaClickedIndex === mediaSiblings.length ? "hidden" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" aria-hidden="true">
        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" fill="var(--mt-color-content-txt)"></path>
      </svg>
    </button>
  `;

    // Call dialog/modal with carousel "id" and HTML content
    this.#openDialog("mt-carousel", carouselHTML);

    // Set carousel interactions for horizontal scroll and buttons
    if (mediaItems.length >= 2) {
      this.#setCarouselInteractions(mediaSiblings.length, mediaClickedIndex);
    }
  }

  /**
   * Add interactions for the carousel
   * @param {Number} t Total number of medias loaded
   * @param {Number} m Index position of media clicked by user
   */
  #setCarouselInteractions(t, m) {
    let currentMediaIndex = m;
    const carousel = document.getElementById("mt-carousel-scroll");
    let scrollTimeout = 0;
    let userScrolling = false;
    const prevBtn = document.getElementById("mt-carousel-prev");
    const nextBtn = document.getElementById("mt-carousel-next");

    // Scroll the carusel to the media element
    const scrollCarouselTo = (i, behavior = "smooth") => {
      document
        .getElementById("mt-carousel-" + i)
        .scrollIntoView({ behavior: behavior });
    };
    // First run, place the scroll on clicked media
    scrollCarouselTo(currentMediaIndex, "instant");

    // Get current index of the media shown on screen
    const updateMediaIndex = () => {
      const scrolledMedia =
        (carousel.scrollLeft + carousel.clientWidth) / carousel.clientWidth;
      return Math.round(scrolledMedia + Number.EPSILON);
    };

    // Scroll interactions
    const isScrolling = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (userScrolling) {
          currentMediaIndex = updateMediaIndex();
          checkBtnsVisibility();
        }
        userScrolling = true;
      }, 60);
    };
    carousel.addEventListener("scroll", isScrolling);

    // Click interactions
    const checkBtnsVisibility = () => {
      prevBtn.hidden = currentMediaIndex === 1;
      nextBtn.hidden = currentMediaIndex === t;
    };

    const userClick = (e) => {
      const idTarget = e.target.closest("button")?.id;

      // Prev/next buttons
      if (idTarget === "mt-carousel-next") {
        userScrolling = false;
        ++currentMediaIndex;
        if (currentMediaIndex > t) currentMediaIndex = t;
        scrollCarouselTo(currentMediaIndex);
        checkBtnsVisibility();
      } else if (idTarget === "mt-carousel-prev") {
        userScrolling = false;
        --currentMediaIndex;
        if (currentMediaIndex < 1) currentMediaIndex = 1;
        scrollCarouselTo(currentMediaIndex);
        checkBtnsVisibility();
      }

      // Close button
      if (idTarget === "mt-carousel-close") {
        killEventListeners();
      }
    };
    document.addEventListener("click", userClick);

    // Keyboard interactions
    const userKeyDown = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        killEventListeners();
      }
    };
    document.addEventListener("keydown", userKeyDown);

    // Kill carousel listeners
    const killEventListeners = () => {
      carousel.removeEventListener("scroll", isScrolling);
      document.removeEventListener("click", userClick);
      document.removeEventListener("keydown", userKeyDown);
    };
  }

  /**
   * Replace the video preview image by the video player
   * @param {Event} e User interaction trigger
   */
  #loadPostVideo(e) {
    const parentNode = e.target.closest("[data-media-type]");
    const urlVideo = parentNode.dataset.mediaUrlHd;
    parentNode.replaceChildren();
    parentNode.innerHTML = `<video controls src="${urlVideo}" autoplay loop></video>`;
  }

  /**
   * Spoiler toggle for text
   * @param {Event} e User interaction trigger
   */
  #toggleTxtSpoiler(e) {
    const button = e.target;
    const spoilerText = button.nextSibling;
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    spoilerText.classList.toggle("spoiler-txt-hidden", isExpanded);
    spoilerText.classList.toggle("spoiler-txt-visible", !isExpanded);
    button.setAttribute("aria-expanded", !isExpanded);
    button.textContent = isExpanded
      ? this.mtSettings.btnShowMore
      : this.mtSettings.btnShowLess;
  }

  /**
   * Spoiler toggle for image/video
   * @param {Event} e User interaction trigger
   */
  #toggleMediaSpoiler(e) {
    const button = e.target;
    const mediaContainer = button.parentNode;
    mediaContainer.classList.toggle(
      "mt-post-media-spoiler",
      !button.classList.contains("mt-btn-spoiler-media-show")
    );
  }

  /**
   * Create preview link
   * @param {Object} c Preview link content
   * @returns {String} Preview link in HTML format
   */
  #createPreviewLink(c) {
    const {
      url,
      image,
      image_description,
      provider_name,
      title,
      description,
      author_name,
    } = c;
    const { previewMaxLines, spinnerClass } = this.mtSettings;

    let previewDescription = "";
    if (previewMaxLines !== "0" && description) {
      previewDescription =
        '<span class="mt-post-preview-description' +
        (previewMaxLines.length !== 0 ? " truncate" : "") +
        '">' +
        this.#parseHTMLstring(description) +
        "</span>";
    }

    return (
      '<a href="' +
      url +
      '" class="mt-post-preview" target="_blank" rel="noopener noreferrer">' +
      (image
        ? '<div class="mt-post-preview-image ' +
          spinnerClass +
          '"><img src="' +
          image +
          '" alt="' +
          this.#escapeHTML(image_description) +
          '" loading="lazy" /></div>'
        : '<div class="mt-post-preview-noImage">📄</div>') +
      '<div class="mt-post-preview-content">' +
      (provider_name
        ? '<span class="mt-post-preview-provider">' +
          this.#parseHTMLstring(provider_name) +
          "</span>"
        : "") +
      '<span class="mt-post-preview-title">' +
      title +
      "</span>" +
      previewDescription +
      (author_name
        ? '<span class="mt-post-preview-author">' +
          this.#parseHTMLstring(author_name) +
          "</span>"
        : "") +
      "</div></a>"
    );
  }

  /**
   * Parse HTML string
   * @param {String} s HTML string
   * @returns {String} Plain text
   */
  #parseHTMLstring(s) {
    const parser = new DOMParser();
    const txt = parser.parseFromString(s, "text/html");
    return txt.body.textContent;
  }

  /**
   * Build footer after last post
   */
  #buildFooter() {
    const {
      btnSeeMore,
      btnReload,
      timelineType,
      profileName,
      hashtagName,
      instanceUrl,
    } = this.mtSettings;
    let btnSeeMoreHTML = "",
      btnReloadHTML = "";

    // Create button to open Mastodon page
    if (btnSeeMore) {
      let btnSeeMorePath = "";
      switch (timelineType) {
        case "profile":
          if (profileName) {
            btnSeeMorePath = profileName;
          } else {
            this.#showError(
              "Please check your <strong>profileName</strong> value",
              "⚠️"
            );
          }
          break;
        case "hashtag":
          btnSeeMorePath = "tags/" + hashtagName;
          break;
        case "local":
          btnSeeMorePath = "public/local";
          break;
      }
      btnSeeMoreHTML =
        '<a class="mt-btn-violet btn-see-more" href="' +
        instanceUrl +
        "/" +
        this.#escapeHTML(btnSeeMorePath) +
        '" rel="nofollow noopener noreferrer" target="_blank">' +
        btnSeeMore +
        "</a>";
    }

    // Create button to refresh the timeline
    if (btnReload) {
      btnReloadHTML =
        '<button class="mt-btn-violet btn-refresh">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 3v5m0 0h-5m5 0l-3-2.708C16.408 3.867 14.305 3 12 3a9 9 0 1 0 0 18c4.283 0 7.868-2.992 8.777-7" stroke="var(--mt-color-btn-txt)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        btnReload +
        "</button>";
    }

    // Add footer container
    this.mtBodyNode.parentNode.insertAdjacentHTML(
      "beforeend",
      '<div class="mt-footer">' + btnSeeMoreHTML + btnReloadHTML + "</div>"
    );

    // Add event listener to the button "Refresh"
    if (btnReload) {
      const reloadBtn = this.mtContainerNode.querySelector(".btn-refresh");
      if (reloadBtn) {
        reloadBtn.addEventListener("click", () => this.mtUpdate());
      }
    }
  }

  /**
   * Add EventListeners for timeline interactions and trigger functions
   */
  #addPostListener() {
    this.mtBodyNode.addEventListener("click", (e) => {
      const target = e.target;
      const localName = target.localName;
      const parentNode = target.parentNode;

      // Check if post cointainer was clicked
      if (
        localName == "article" ||
        target.offsetParent?.localName == "article" ||
        (this.mtSettings.disableCarousel &&
          parentNode.getAttribute("data-media-type") === "image")
      ) {
        this.#openPostUrl(e);
      }

      // Check if spoiler text button was clicked
      if (target.classList.contains("mt-btn-spoiler-txt")) {
        this.#toggleTxtSpoiler(e);
      }

      // Check if spoiler media button was clicked
      if (target.classList.contains("mt-btn-spoiler-media")) {
        this.#toggleMediaSpoiler(e);
      }

      // Check if image in post was clicked
      if (
        !this.mtSettings.disableCarousel &&
        localName == "img" &&
        (parentNode.getAttribute("data-media-type") === "image" ||
          parentNode.getAttribute("data-media-type") === "audio")
      ) {
        this.#showCarousel(e);
      }

      // Check if video preview image or play icon/button was clicked
      if (
        target.className == "mt-btn-play" ||
        (localName == "svg" && parentNode.className == "mt-btn-play") ||
        (localName == "path" &&
          parentNode.parentNode.className == "mt-btn-play") ||
        (localName == "img" &&
          (parentNode.getAttribute("data-media-type") === "video" ||
            parentNode.getAttribute("data-media-type") === "gifv"))
      ) {
        this.#loadPostVideo(e);
      }
    });
    this.mtBodyNode.addEventListener("keydown", (e) => {
      const localName = e.target.localName;
      // Check if Enter key was pressed with focus in an article
      if (e.key === "Enter" && localName == "article") {
        this.#openPostUrl(e);
      }
    });
  }

  /**
   * Open post in a new tab/page avoiding any other natural link
   * @param {Event} e User interaction trigger
   */
  #openPostUrl(e) {
    const urlPost = e.target.closest(".mt-post")?.dataset.location;
    if (!urlPost) return;

    const tagName = e.target.localName;
    if (
      tagName === "a" ||
      tagName === "span" ||
      tagName === "button" ||
      tagName === "bdi" ||
      tagName === "time"
    )
      return;

    const targetClass = e.target.className;
    if (
      targetClass === "mt-post-media-spoiler" ||
      targetClass === "mt-post-preview-noImage"
    )
      return;

    const parentClass = e.target.parentNode?.className;
    if (
      parentClass === "mt-post-avatar-image-big" ||
      parentClass === "mt-post-avatar-image-small" ||
      parentClass === "mt-post-header-user-name" ||
      parentClass === "mt-post-preview-image" ||
      parentClass === "mt-post-preview"
    )
      return;

    window.open(urlPost, "_blank", "noopener");
  }

  /**
   * Add/Remove EventListeners for loading spinner
   */
  #manageSpinner() {
    // Remove EventListener and CSS class to container
    const removeSpinner = (e) => {
      e.target.parentNode.classList.remove(this.mtSettings.spinnerClass);
      e.target.removeEventListener("load", removeSpinner);
      e.target.removeEventListener("error", removeSpinner);
    };
    // Add EventListener to images
    this.mtBodyNode
      .querySelectorAll(`.${this.mtSettings.spinnerClass} > img`)
      .forEach((e) => {
        e.addEventListener("load", removeSpinner);
        e.addEventListener("error", removeSpinner);
      });
  }

  /**
   * Show an error on the timeline
   * @param {String} e Error message
   * @param {String} i Icon
   */
  #showError(t, i) {
    const icon = i || "❌";
    this.mtBodyNode.innerHTML = `
      <div class="mt-error">
        <span class="mt-error-icon">${icon}</span>
        <strong>Oops, something's happened:</strong>
        <div class="mt-error-message">${t}</div>
      </div>`;
    this.mtBodyNode.setAttribute("role", "none");
    throw new Error(
      "Stopping the script due to an error building the timeline."
    );
  }
}
