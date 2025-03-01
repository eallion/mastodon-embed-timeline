# 🐘 Mastodon embed timeline - ⚙️ Setup

## Initialize

Add the following HTML structure in your page:

```html
<div id="mt-container" class="mt-container">
  <div class="mt-body" role="feed">
    <div class="mt-loading-spinner"></div>
  </div>
</div>
```

Now you can then initialize the script running:

```js
const myTimeline = new MastodonTimeline.Init();
```

By default it will show a timeline with 20 posts from the instance [mastodon.social](https://mastodon.social/public/local)

ℹ️ If you are trying to initialize the script before `mastodon-timeline.umd.js` is loaded, you will probably get such an error in the console:  
"_MastodonTimeline is not defined_".  
To fix that try to initialize the script as follow:

```js
window.addEventListener("load", () => {
  const myTimeline = new MastodonTimeline.Init();
});
```

## Timeline type

There are three types, **Local**, **Profile** and **Hashtag**. Here you have an example of each one to see how it works:

### Local timeline

To show a timeline with posts from a local instance (e.g. [mastodon.online](https://mastodon.online/public/local)) add the following option/value when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
});
```

### Profile timeline

To show a timeline with posts from a Mastodon profile (e.g. [@idotj](https://mastodon.online/@idotj)) add the following options/values when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
  timelineType: "profile",
  userId: "000180745",
  profileName: "@idotj",
});
```

ℹ️ If you don't know your `userId` you have two ways to get it:

- Copy the url below and paste it in a new tab. Remember to replace the words `INSTANCE` and `USERNAME` with your current values in the url:  
  <https://INSTANCE/api/v1/accounts/lookup?acct=USERNAME>  
  The first value you see in the list is your `id` number.

- Click on the link below and put your `@USERNAME` and `@INSTANCE` in the input field:  
  [https://mastodon-userid-lookup.jcxldn.net/](https://mastodon-userid-lookup.jcxldn.net/)

### Hashtag timeline

To show a timeline with posts containing a hashtag (e.g. [#fediverse](https://mastodon.online/tags/fediverse)) add the following options/values when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
  timelineType: "hashtag",
  hashtagName: "fediverse",
});
```

## Customize

There is a long list of parameters that allows you to quickly customize your timeline:

```js
  // Id of the <div> containing the timeline
  // Default: "mt-container"
  mtContainerId: "mt-container",

  // Mastodon instance Url including https://
  // Default: "https://mastodon.social"
  instanceUrl: "https://mastodon.social",

  // Choose type of posts to show in the timeline: 'local', 'profile', 'hashtag'
  // Default: "local"
  timelineType: "local",

  // Your user ID number on Mastodon instance
  // Leave it empty if you didn't choose 'profile' as type of timeline
  // Default: ""
  userId: "",

  // Your user name on Mastodon instance (including the @ symbol at the beginning)
  // Leave it empty if you didn't choose 'profile' as type of timeline
  // Default: ""
  profileName: "",

  // The name of the hashtag (without the # symbol)
  // Leave it empty if you didn't choose 'hashtag' as type of timeline
  // Default: ""
  hashtagName: "",

  // Class name for the loading spinner (also used in CSS file)
  // Default: "mt-loading-spinner"
  spinnerClass: "mt-loading-spinner",

  // Preferred color theme: "light", "dark" or "auto"
  // Default: "auto"
  defaultTheme: "auto",

  // Maximum number of posts to request to the server
  // Default: "20"
  maxNbPostFetch: "20",

  // Maximum number of posts to show in the timeline
  // Default: "20"
  maxNbPostShow: "20",

  // Set the format of the date according to the chosen language/country
  // Default: "en-GB" (British English: day-month-year order)
  dateFormatLocale: "en-GB",

  // Customize the date format using the options for day, month and year
  // Default: day: "2-digit", month: "short", year: "numeric" (DD MMM YYYY)
  dateFormatOptions: {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },

  // Hide unlisted posts
  // Default: false (don't hide)
  hideUnlisted: false,

  // Hide boosted posts
  // Default: false (don't hide)
  hideReblog: false,

  // Hide replies posts
  // Default: false (don't hide)
  hideReplies: false,

  // Hide pinned posts from the profile timeline
  // Default: false (don't hide)
  hidePinnedPosts: false,

  // Hide the user account under the user name
  // Default: false (don't hide)
  hideUserAccount: false,

  // Show only posts with the selected language (ISO 639-1)
  // Use "en" to show only posts in English
  // Default: "" (don't filter by language)
  filterByLanguage: "",

  // Limit the text content to a maximum number of lines
  // Use "0" to show no text
  // Default: "" (unlimited)
  txtMaxLines: "",

  // Customize the text of the button used for showing/hiding sensitive/spoiler text
  btnShowMore: "SHOW MORE",
  btnShowLess: "SHOW LESS",  

  // Convert Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag
  // Default: false (don't apply)
  markdownBlockquote: false,  

  // Hide custom emojis available on the server
  // Default: false (don't hide)
  hideEmojos: false,  

  // Customize the text of the button used for showing a sensitive/spoiler media content
  btnShowContent: "SHOW CONTENT",  

  // Hide video image preview and load the video player instead
  // Default: false (don't hide)
  hideVideoPreview: false,

  // Customize the text of the button used for the image preview to play the video
  btnPlayVideoTxt: "Load and play video",  

  // Hide preview card if post contains a link, photo or video from a Url
  // Default: false (don't hide)
  hidePreviewLink: false,

  // Limit the preview text description to a maximum number of lines
  // Use "0" to show no text
  // Default: "" (unlimited)
  previewMaxLines: "",

  // Hide replies, boosts and favourites posts counter
  // Default: false (don't hide)
  hideCounterBar: false,

  // Disable a carousel/lightbox when the user clicks on a picture in a post
  // Default: false (not disabled)
  disableCarousel: false,

  // Customize the text of the buttons used for the carousel/lightbox
  // Default:
  carouselCloseTxt: "Close carousel",
  carouselPrevTxt: "Previous media item",
  carouselNextTxt: "Next media item", 

  // Customize the text of the button pointing to the Mastodon page placed at the end of the timeline
  // Leave the value empty to hide it
  // Default:
  btnSeeMore: "See more posts at Mastodon",

  // Customize the text of the button reloading the list of posts placed at the end of the timeline
  // Leave the value empty to hide it
  // Default:
  btnReload: "Refresh",

  // Keep searching for the main <div> container before building the timeline. Useful in some cases where extra time is needed to render the page
  // Default: false (don't apply)
  insistSearchContainer: false,

  // Define the maximum time to continue searching for the main <div> container
  // Default: "3000" (3 seconds)
  insistSearchContainerTime: "3000",

```

In the `examples/` folder there is an HTML file `local-timeline-customized.html` that you can use as a referente to see how to customize your timeline by overwriting some CSS styles and using several parameters when initializing the timeline.

Also, if you need to change something in the core files (`src/` folder), I recommend you to read the document [CONTRIBUTING.md](https://gitlab.com/idotj/mastodon-embed-timeline/-/blob/master/CONTRIBUTING.md#testing) to see how to compile and test your changes.

