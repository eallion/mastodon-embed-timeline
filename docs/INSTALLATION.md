# 🐘 Mastodon embed timeline - 🛠️ Installation

You have three different ways to install it in your project:
- [Download](#download)
- [CDN](#cdn)
- [Package manager](#package-manager)

## Download

Download and copy these two files into your project folder:

- `dist/mastodon-timeline.min.css`
- `dist/mastodon-timeline.umd.js`

Load the CSS and JS files in your HTML page using the `<link>` and `<script>` tags as follows in this example:

```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Example of site title</title>
    <!-- Your CSS -->
    <link href="your/path/to/file/mastodon-timeline.min.css" rel="stylesheet" />
  </head>

  <body>
    <!-- HTML content -->
    ...

    <!-- Your JavaScript -->
    <script src="your/path/to/file/mastodon-timeline.umd.js"></script>
    <script>
      // You can initialize the script here
    </script>
  </body>
</html>
```

## CDN

This option allows you to start without the need to upload any files on your server.  
Copy the following CSS and JS links to include them in your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@idotj/mastodon-embed-timeline@4.6.0/dist/mastodon-timeline.min.css" integrity="sha256-Qi3H+bdH6RuMuyR1trAlG5bMWJGl9y3jPiTc1PWQFpI=" crossorigin="anonymous">
```

```html
<script src="https://cdn.jsdelivr.net/npm/@idotj/mastodon-embed-timeline@4.6.0/dist/mastodon-timeline.umd.js" integrity="sha256-atEPYqs4j5Ogqb9yl3++jbRmTIItqwZUhpnTWdNsF2c=" crossorigin="anonymous"></script>
```

## Package manager

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
