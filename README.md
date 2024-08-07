# 🐘 Mastodon embed timeline

![Mastodon timeline widget screenshot](screenshot-light-dark.jpg "Mastodon timeline widget screenshot")

Embed a Mastodon timeline in your page, only with a CSS and JS file.

Demo running:
<https://codepen.io/ipuntoj/pen/MWppNGL>

## 📋 Table of contents

- [Installation](#installation)
  - [Download](#download)
  - [CDN](#cdn)
  - [Package manager](#package-manager)
- [Setup](#setup)
  - [Initialize](#initialize)
    - [Local timeline](#local-timeline)
    - [Profile timeline](#profile-timeline)
    - [Hashtag timeline](#hashtag-timeline)
  - [Customize](#customize)
- [API](#api)
- [Examples](#examples)

## Installation

You have three different ways to install it in your project, choose the one that best suits your needs:

### Download

Download into your project the following compiled and minified files:

- `dist/mastodon-timeline.min.css`
- `dist/mastodon-timeline.umd.js`

Now call the CSS and JS files in your HTML page using the `<link>` and `<script>` tags as follows in this example:

```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your site title</title>
    <!-- CSS -->
    <link href="path/to/mastodon-timeline.min.css" rel="stylesheet" />
  </head>

  <body>
    <!-- Your HTML content -->

    <!-- JavaScript -->
    <script src="path/to/mastodon-timeline.umd.js"></script>
    <script>
      // You can initialize the script here
    </script>
  </body>
</html>
```

### CDN

This option allows you to start without the need to upload any files on your server.  
Copy the following CSS and JS links to include them in your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@idotj/mastodon-embed-timeline@4.4.2/dist/mastodon-timeline.min.css" integrity="sha256-1UGgxsonaMCfOEnVOL89aMKSo3GEAmaRP0ISbsWa6lU=" crossorigin="anonymous">
```

```html
<script src="https://cdn.jsdelivr.net/npm/@idotj/mastodon-embed-timeline@4.4.2/dist/mastodon-timeline.umd.js" integrity="sha256-E6WPG6iq+qQIzvu3HPJJxoAeRdum5siq13x4ITjyxu8=" crossorigin="anonymous"></script>
```

### Package manager

A quick way to get it installed using **npm** or **yarn**:

```terminal
npm install @idotj/mastodon-embed-timeline
```

or

```terminal
yarn add @idotj/mastodon-embed-timeline
```

After installation, you can import it as follows:

```js
import * as MastodonTimeline from "@idotj/mastodon-embed-timeline";
```

Make sure to import also the file `mastodon-timeline.min.css` into your project.

## Setup

### Initialize

To get your timeline up add the following HTML structure in your page:

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

The next step is to configure the options/values of your timeline according to the type you prefer. There are three types, **Local**, **Profile** and **Hashtag**. Here you have an example of each one to see how it works:

#### Local timeline

To show a timeline with posts from the instance [mastodon.online](https://mastodon.online/public/local) add the following option/value when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
});
```

#### Profile timeline

To show a timeline with posts from my Mastodon profile [@idotj](https://mastodon.online/@idotj) add the following options/values when initializing the timeline:

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
  [https://prouser123.me/mastodon-userid-lookup/](https://prouser123.me/mastodon-userid-lookup/)

#### Hashtag timeline

To show a timeline with posts containing the hashtag [#fediverse](https://mastodon.online/tags/fediverse) add the following options/values when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
  timelineType: "hashtag",
  hashtagName: "fediverse",
});
```

### Customize

In the `examples/` folder there is an HTML file `local-timeline-customized.html` where you can see how to customize your timeline by overwriting the CSS styles and using several JS options when initializing the timeline.

If you need to change something in the core files (`src/` folder), I recommend you to read the document [CONTRIBUTING.md](https://gitlab.com/idotj/mastodon-embed-timeline/-/blob/master/CONTRIBUTING.md#testing) to see how to compile and test your changes.

Here you have all the options available to quickly setup and customize your timeline:

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

  // The name of the hashtag (not including the # symbol)
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

  // Specifies the format of the date according to the chosen language/country
  // Default: "en-GB" (British English: day-month-year order)
  dateLocale: "en-GB",

  // Customize the date format using the options for day, month and year
  // Default: day: "2-digit", month: "short", year: "numeric" (DD MMM YYYY)
  dateOptions: {
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

  // Limit the text content to a maximum number of lines
  // Use "0" to show no text
  // Default: "" (unlimited)
  txtMaxLines: "",

  // Customize the text of the button used for showing/hiding sensitive/spoiler text
  btnShowMore: "SHOW MORE",
  btnShowLess: "SHOW LESS",  

  // Converts Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag
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
  carouselCloseTxt: "Close carousel",
  carouselPrevTxt: "Previous media item",
  carouselNextTxt: "Next media item", 

  // Customize the text of the button pointing to the Mastodon page placed at the end of the timeline
  // Leave the value empty to hide it
  btnSeeMore: "See more posts at Mastodon",

  // Customize the text of the button reloading the list of posts placed at the end of the timeline
  // Leave the value empty to hide it
  btnReload: "Refresh",

  // Keep searching for the main <div> container before building the timeline. Useful in some cases where extra time is needed to render the page
  // Default: false (don't apply)
  insistSearchContainer: false,

  // Defines the maximum time to continue searching for the main <div> container
  // Default: "3000" (3 seconds)
  insistSearchContainerTime: "3000",

```

## API

| Function                  | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `mtColorTheme(themeType)` | Apply a theme color. `themeType` accepts only two values: `'light'` or `'dark'` |
| `mtUpdate()`              | Reload the timeline by fetching the lastest posts                               |

## Examples

The folder `examples/` contains several demos in HTML to play with. Download the full project and open each HTML file in your favorite browser.

Also, you have other alternatives to run these examples locally. Consult the document [CONTRIBUTING.md](https://gitlab.com/idotj/mastodon-embed-timeline/-/blob/master/CONTRIBUTING.md#testing) to use options such as Docker or Http-server.

## 🌐 Browser support

Mastodon embed timeline is supported on the latest versions of the following browsers:

- Chrome
- Firefox
- Edge
- Safari
- Vivaldi
- Opera

## 🚀 Improve me

Feel free to add your features and improvements.  
Take a look at the [CONTRIBUTING.md](https://gitlab.com/idotj/mastodon-embed-timeline/-/blob/master/CONTRIBUTING.md) document to learn more about how to build and collaborate on the project.

## ⚖️ License

GNU Affero General Public License v3.0

## 💬 FAQ

Check the [closed issues](https://gitlab.com/idotj/mastodon-embed-timeline/-/issues/?sort=created_date&state=closed&first_page_size=20), you might find your question there.

If nothing matches with your problem, check the [open issues](https://gitlab.com/idotj/mastodon-embed-timeline/-/issues/?sort=created_date&state=opened&first_page_size=20) or feel free to create a new one.

Looking for a previous version of Mastodon embed timeline?  
Check on the tags list to see all the released versions: [Tags history](https://gitlab.com/idotj/mastodon-embed-timeline/-/tags)

## Alternatives

Other projects to embed your Mastodon timeline:

- <https://gitlab.com/clvgt12/mastodon-embed-feed-timeline> (fork of this project)
- <https://github.com/sampsyo/emfed>
- <https://mastofeed.com>
- <https://github.com/SamTherapy/fedifeed> (fork of mastofeed)
- <https://github.com/DomainDrivenArchitecture/dda-masto-embed>
- <https://github.com/DyosTheNerd/MastodonIFrameEmbed>
