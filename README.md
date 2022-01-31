# 🐘 Mastodon embed timeline

Embed a mastodon feed timeline in your page, only with a css and js file.

Working version running at:
<https://www.idotj.com>

Source code running at:
<https://codepen.io/ipuntoj/pen/MWppNGL>

## 🗂️ User guide

Just copy both files (.css and .js) in your project

```
<link rel="stylesheet" href="mastodon-timeline.css">
```

```
<script src='mastodon-timeline.js'></script>
```

and add the following structure in your html page:

```
<div id="mt-timeline" class="mt-timeline">
    <div id="mt-body" class="mt-body">
        <div class="loading-spinner"></div>
    </div>
</div>
```

Now you have a Mastodon timeline running in your page.

The next step will be to setup the timeline with your account info.
For that, edit the the JS file *mastodon-timeline.js*  and at the beginning replace the following values:

```
    instance_uri:   'Your Mastodon instance',
    user_id:        'Your user ID on Mastodon instance',
    profile_name:   'Your user name on Mastodon instance',
```

If you don't find your user_id, just copy your @profile_name and @instance_uri here:  
<a href="https://prouser123.me/mastodon-userid-lookup/" target="_blank" rel="noopener">https://prouser123.me/mastodon-userid-lookup/</a>

## 🚀 Improve me

Feel free to add/improve the styles and add more features.

## ⚖️ License

GNU Affero General Public License v3.0
