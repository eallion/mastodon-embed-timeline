# Mastodon embed timeline

Embed a mastodon feed timeine in your page, only with a css and js file.

Working version running at:
https://www.idotj.com

Source code running at:
https://codepen.io/ipuntoj/pen/MWppNGL

## User guide

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

## Changing the profile

At the beginning of the JS file *mastodon-timeline.js* replace the following values:
```
    instance_uri: 'The Mastodon instance',
    account_id: 'Your user ID on Mastodon instance',
    profile_name: 'Your user name on Mastodon instance',
```

## Improve me

Feel free to add/improve the styles and add more features.
