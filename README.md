# 🐘 Mastodon embed timeline (new v4.2)

![Mastodon timeline widget screenshot](screenshot-light-dark.jpg "Mastodon timeline widget screenshot")

Embed a mastodon timeline in your page, only with a CSS and JS file.

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

### Download

Ready-to-use compiled and minified files to easily start.

- Download into your project the following files:
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

This option allows you to get started quickly without the need to upload any files into your server.

```html
JS and CSS files available soon!
```

### Package manager

Install your timeline using npm or yarn:

```terminal
npm install @idotj/mastodon-embed-timeline
```

or

```terminal
yarn add @idotj/mastodon-embed-timeline
```

After installation, you can import the widget as follows:

```js
import * as MastodonTimeline from "@idotj/mastodon-embed-timeline";
```

Make sure to import also the `@idotj/mastodon-embed-timeline/dist/mastodon-timeline.min.css` file in your project.

## Setup

### Initialize

The first step to get your timeline up is to add the following HTML structure in your page:

```html
<div id="mt-container" class="mt-container">
  <div class="mt-body" role="feed">
    <div class="mt-loading-spinner"></div>
  </div>
</div>
```

Then after that you can initialize the script by running:

```js
const myTimeline = new MastodonTimeline.Init();
```

By default it will show a timeline with 20 posts from the instance [mastodon.social](https://mastodon.social/public/local)

ℹ️ If you are trying to initialize the script before `mastodon-timeline.umd.js` is loaded, you will probably get such an error in the console: "_MastodonTimeline is not defined_". To fix that initialize the script by running:

```js
window.addEventListener("load", () => {
  const myTimeline = new MastodonTimeline.Init();
});
```

The next step is to configure the options/values of your timeline according to the type you need. There are three types, **Local**, **Profile** and **Hashtag**:

#### Local timeline

Add the following option/value when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
});
```

It will show a timeline with posts from the instance [mastodon.online](https://mastodon.online/public/local)

#### Profile timeline

Add the following options/values when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
  timelineType: "profile",
  userId: "000180745",
  profileName: "@idotj",
});
```

It will show a timeline with posts from my Mastodon profile [@idotj](https://mastodon.online/@idotj)

ℹ️ If you don't know your `userId` you have two ways to get it:

- Copy the url below and paste it in a new tab. Remember to replace the words `INSTANCE` and `USERNAME` with your current values in the url:  
  <https://INSTANCE/api/v1/accounts/lookup?acct=USERNAME>  
  The first value you see in the list is your `id` number.

- Click on the link below and put your `@USERNAME` and `@INSTANCE` in the input field:  
  [https://prouser123.me/mastodon-userid-lookup/](https://prouser123.me/mastodon-userid-lookup/)

#### Hashtag timeline

Add the following options/values when initializing the timeline:

```js
const myTimeline = new MastodonTimeline.Init({
  instanceUrl: "https://mastodon.online",
  timelineType: "hashtag",
  hashtagName: "fediverse",
});
```

It will show a timeline with posts containing the hashtag [#fediverse](https://mastodon.online/tags/fediverse)

### Customize

You can pass more options/values to personalize your timeline. Here you have all the available options:

```js
  // Id of the <div> containing the timeline
  mtContainerId: "mt-container",

  // Mastodon instance Url (including https://)
  instanceUrl: "https://mastodon.social",

  // Choose type of posts to show in the timeline: 'local', 'profile', 'hashtag'. Default: local
  timelineType: "local",

  // Your user ID number on Mastodon instance. Leave it empty if you didn't choose 'profile' as type of timeline
  userId: "",

  // Your user name on Mastodon instance (including the @ symbol at the beginning). Leave it empty if you didn't choose 'profile' as type of timeline
  profileName: "",

  // The name of the hashtag (not including the # symbol). Leave it empty if you didn't choose 'hashtag' as type of timeline
  hashtagName: "",

  // Class name for the loading spinner (also used in CSS file)
  spinnerClass: "mt-loading-spinner",

  // Preferred color theme: 'light', 'dark' or 'auto'. Default: auto
  defaultTheme: "auto",

  // Maximum number of posts to request to the server. Default: 20
  maxNbPostFetch: "20",

  // Maximum number of posts to show in the timeline. Default: 20
  maxNbPostShow: "20",

  // Hide unlisted posts. Default: don't hide
  hideUnlisted: false,

  // Hide boosted posts. Default: don't hide
  hideReblog: false,

  // Hide replies posts. Default: don't hide
  hideReplies: false,

  // Hide video image preview and load video player instead. Default: don't hide
  hideVideoPreview: false,

  // Hide preview card if post contains a link, photo or video from a Url. Default: don't hide
  hidePreviewLink: false,

  // Hide custom emojis available on the server. Default: don't hide
  hideEmojos: false,

  // Converts Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag. Default: don't apply
  markdownBlockquote: false,

  // Hide replies, boosts and favourites posts counter. Default: don't hide
  hideCounterBar: false,

  // Limit the text content to a maximum number of lines. Default: 0 (unlimited)
  txtMaxLines: "0",

  // Customize the text of the button used for showing/hiding sensitive/spolier text
  btnShowMore: "SHOW MORE",
  btnShowLess: "SHOW LESS",

  // Customize the text of the button used for showing sensitive/spolier media content
  btnShowContent: "SHOW CONTENT",

  // Customize the text of the button pointing to the Mastodon page placed at the end of the timeline. Leave the value empty to hide it
  btnSeeMore: "See more posts at Mastodon",

  // Customize the text of the button reloading the list of posts placed at the end of the timeline. Leave the value empty to hide it
  btnReload: "Refresh",

  // Keep searching for the main <div> container before building the timeline. Useful in some cases where extra time is needed to render the page. Default: false
  insistSearchContainer: false,

  // Defines the maximum time to continue searching for the main <div> container. Default: 3 seconds
  insistSearchContainerTime: "3000",

```

### API

| Function                  | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `mtColorTheme(themeType)` | Apply a theme color. `themeType` accepts only two values: `'light'` or `'dark'` |
| `mtUpdate()`              | Reload the timeline by fetching the lastest posts                               |

### Examples

The folder `examples/` contains several demos in HTML to play with. Download the full project and open each HTML file in your favorite browser.

Also, you have other alternatives to run these examples locally. Consult the document [CONTRIBUTING.md](https://gitlab.com/idotj/mastodon-embed-timeline/-/blob/master/CONTRIBUTING.md#testing) to use other options like Docker or Http-server.

## 🌐 Browser support

Mastodon embed timeline is supported on the latest versions of the following browsers:

- Chrome
- Firefox
- Edge
- Safari
- Brave
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
