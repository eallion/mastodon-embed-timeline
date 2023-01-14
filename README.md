# 🐘 Mastodon embed timeline

Embed a mastodon feed timeline in your page, only with a css and js file.

Working version running at:
<https://www.idotj.com>

Source code running at:
<https://codepen.io/ipuntoj/pen/MWppNGL>

## 🗂️ User guide

Just copy both files (*mastodon-timeline.css* and *mastodon-timeline.js* from /src folder) in your project folder.

Now call each one in your page using the `<link>` and `<script>` tag:
```
<link rel="stylesheet" href="mastodon-timeline.css">
```

```
<script src='mastodon-timeline.js'></script>
```

Then copy the following html structure:

```
<div id="mt-timeline" class="mt-timeline">
    <div id="mt-body" class="mt-body">
        <div class="loading-spinner"></div>
    </div>
</div>
```

Great, you have a Mastodon timeline running in your page.

The next step will be to setup the timeline with your account info.
For that, edit the the JS file *mastodon-timeline.js*  and at the beginning replace the following values:

```
    instance_uri:   'Your Mastodon instance',
    user_id:        'Your user ID on Mastodon instance',
    profile_name:   'Your user name on Mastodon instance',
```

If you don't know your user_id, you have two ways to get it:

- Right click on your avatar image and inspect the element. You will see in your html code a line like this one:  
`<img src="https://files.xxxxxxxx.xx/accounts/avatars/000/180/745/original/xxxxxxxxxx.png" alt="xxxx">`  
Check the `src=""` url, your user id is between `/accounts/avatars/` and `/original/`. So removing the slashs `/` you will get your user id, like in the example: `000180745`


- Other option, just copy your @profile_name and @instance_uri here:  
<a href="https://prouser123.me/mastodon-userid-lookup/" target="_blank" rel="noopener">https://prouser123.me/mastodon-userid-lookup/</a>

Also you can customize some parameters:

```
    // The maximun amount of toots to get from the user
    toots_limit: 13

    // Hide the boosted toots
    hide_reblog: true

    // Hide the replies from the user
    hide_replies: true

    // Customize the text of the button after the last toot
    btn_see_more: 'See more posts at Mastodon'

```

*Project forked from: https://github.com/AzetJP/mastodon-timeline-widget

## 🚀 Improve me

Feel free to add/improve the styles and add more features.

## ⚖️ License

GNU Affero General Public License v3.0
