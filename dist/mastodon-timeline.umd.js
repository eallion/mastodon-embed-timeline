!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).MastodonTimeline={})}(this,(function(t){"use strict";
/**
   * Mastodon embed timeline
   * @author idotj
   * @version 4.5.0
   * @url https://gitlab.com/idotj/mastodon-embed-timeline
   * @license GNU AGPLv3
   */t.Init=class{constructor(t={}){this.defaultSettings={mtContainerId:"mt-container",instanceUrl:"https://mastodon.social",timelineType:"local",userId:"",profileName:"",hashtagName:"",spinnerClass:"mt-loading-spinner",defaultTheme:"auto",maxNbPostFetch:"20",maxNbPostShow:"20",dateFormatLocale:"en-GB",dateFormatOptions:{day:"2-digit",month:"short",year:"numeric"},hideUnlisted:!1,hideReblog:!1,hideReplies:!1,hidePinnedPosts:!1,hideUserAccount:!1,txtMaxLines:"",filterByLanguage:"",btnShowMore:"SHOW MORE",btnShowLess:"SHOW LESS",markdownBlockquote:!1,hideEmojos:!1,btnShowContent:"SHOW CONTENT",hideVideoPreview:!1,btnPlayVideoTxt:"Load and play video",hidePreviewLink:!1,previewMaxLines:"",hideCounterBar:!1,disableCarousel:!1,carouselCloseTxt:"Close carousel",carouselPrevTxt:"Previous media item",carouselNextTxt:"Next media item",btnSeeMore:"See more posts at Mastodon",btnReload:"Refresh",insistSearchContainer:!1,insistSearchContainerTime:"3000"},this.mtSettings={...this.defaultSettings,...t},this.#t(),this.linkHeader={},this.mtContainerNode="",this.mtBodyNode="",this.fetchedData={},this.#e((()=>{this.#i()}))}#t(){Number(this.mtSettings.maxNbPostShow)>Number(this.mtSettings.maxNbPostFetch)&&(console.error(`Please check your settings! The maximum number of posts to show is bigger than the maximum number of posts to fetch. Changing the value of "maxNbPostFetch" to: ${this.mtSettings.maxNbPostShow}`),this.mtSettings.maxNbPostFetch=this.mtSettings.maxNbPostShow)}#e(t){"undefined"!=typeof document&&"complete"===document.readyState?t():"undefined"!=typeof document&&"complete"!==document.readyState&&document.addEventListener("DOMContentLoaded",t())}#i(){const t=()=>{this.mtContainerNode=document.getElementById(this.mtSettings.mtContainerId),this.mtBodyNode=this.mtContainerNode.getElementsByClassName("mt-body")[0],this.#s(),this.#a("newTimeline")};if(this.mtSettings.insistSearchContainer){const e=performance.now(),i=()=>{if(document.getElementById(this.mtSettings.mtContainerId))t();else{performance.now()-e<this.mtSettings.insistSearchContainerTime?requestAnimationFrame(i):console.error(`Impossible to find the <div> container with id: "${this.mtSettings.mtContainerId}" after several attempts for ${this.mtSettings.insistSearchContainerTime/1e3} seconds`)}};i()}else document.getElementById(this.mtSettings.mtContainerId)?t():console.error(`Impossible to find the <div> container with id: "${this.mtSettings.mtContainerId}". Please try to add the option 'insistSearchContainer: true' when initializing the script`)}mtUpdate(){this.#e((()=>{this.mtBodyNode.replaceChildren(),this.mtBodyNode.insertAdjacentHTML("afterbegin",'<div class="mt-loading-spinner"></div>'),this.#a("updateTimeline")}))}mtColorTheme(t){this.#e((()=>{this.mtContainerNode.setAttribute("data-theme",t)}))}#s(){if("auto"===this.mtSettings.defaultTheme){let t=window.matchMedia("(prefers-color-scheme: dark)");t.matches?this.mtColorTheme("dark"):this.mtColorTheme("light"),t.addEventListener("change",(t=>{t.matches?this.mtColorTheme("dark"):this.mtColorTheme("light")}))}else this.mtColorTheme(this.mtSettings.defaultTheme)}#n(){return new Promise(((t,e)=>{const i=this.mtSettings.instanceUrl?`${this.mtSettings.instanceUrl}/api/v1/`:this.#o("Please check your <strong>instanceUrl</strong> value","⚠️"),s=this.#r(i),a=Object.entries(s).map((([t,i])=>{const s="timeline"===t;return this.#l(i,s).then((e=>({[t]:e}))).catch((s=>(e(new Error(`Something went wrong fetching data from: ${i}`)),this.#o(s.message),{[t]:[]})))}));Promise.all(a).then((async e=>{if(this.fetchedData=e.reduce(((t,e)=>({...t,...e})),{}),!this.mtSettings.hidePinnedPosts&&void 0!==this.fetchedData.pinned?.length&&0!==this.fetchedData.pinned.length){const t=this.fetchedData.pinned.map((t=>({...t,pinned:!0})));this.fetchedData.timeline=[...t,...this.fetchedData.timeline]}if(this.#d())t();else{do{await this.#m()}while(!this.#d()&&this.linkHeader.next);t()}}))}))}#r(t){const{timelineType:e,userId:i,hashtagName:s,maxNbPostFetch:a,hidePinnedPosts:n,hideEmojos:o}=this.mtSettings,r={};switch(e){case"profile":if(!i){this.#o("Please check your <strong>userId</strong> value","⚠️");break}r.timeline=`${t}accounts/${i}/statuses?limit=${a}`,n||(r.pinned=`${t}accounts/${i}/statuses?pinned=true`);break;case"hashtag":if(!s){this.#o("Please check your <strong>hashtagName</strong> value","⚠️");break}r.timeline=`${t}timelines/tag/${s}?limit=${a}`;break;case"local":r.timeline=`${t}timelines/public?local=true&limit=${a}`;break;default:this.#o("Please check your <strong>timelineType</strong> value","⚠️")}return o||(r.emojos=`${t}custom_emojis`),r}async#l(t,e=!1){const i=await fetch(t);if(!i.ok)throw new Error(`\n        Failed to fetch the following Url:<br />${t}<hr />Error status: ${i.status}<hr />Error message: ${i.statusText}\n        `);const s=await i.json();return e&&i.headers.get("Link")&&(this.linkHeader=this.#h(i.headers.get("Link"))),s}#d(){return this.fetchedData.timeline.length>=Number(this.mtSettings.maxNbPostFetch)}#m(){return new Promise((t=>{this.linkHeader.next?this.#l(this.linkHeader.next,!0).then((e=>{this.fetchedData.timeline=[...this.fetchedData.timeline,...e],t()})):t()}))}#h(t){const e=t.split(", ").map((t=>t.split("; "))).map((t=>[t[1].replace(/"/g,"").replace("rel=",""),t[0].slice(1,-1)]));return Object.fromEntries(e)}async#a(t){await this.#n();const{hideUnlisted:e,hideReblog:i,hideReplies:s,maxNbPostShow:a,filterByLanguage:n}=this.mtSettings,o=this.fetchedData.timeline;this.mtBodyNode.replaceChildren();if(o.filter((t=>{const a="public"===t.visibility||!e&&"unlisted"===t.visibility,o=i&&t.reblog,r=s&&t.in_reply_to_id,l=t.language||(t.reblog?t.reblog.language:null);return a&&!o&&!r&&(""===n||l===n)})).forEach(((t,e)=>{e<a&&this.#c(t,e)})),""!==this.mtBodyNode.innerHTML)"newTimeline"===t?(this.#p(),this.#g(),this.#u(0),this.#v(),(this.mtSettings.btnSeeMore||this.mtSettings.btnReload)&&this.#b()):"updateTimeline"===t?this.#p():this.#o("The function buildTimeline() was expecting a param");else{const t=`No posts to show<hr />${o?.length||0} posts have been fetched from the server<hr />This may be due to an incorrect configuration with the parameters or with the filters applied (to hide certains type of posts)`;this.#o(t,"📭")}}#g(){"0"!==this.mtSettings.txtMaxLines&&0!==this.mtSettings.txtMaxLines.length&&this.mtBodyNode.parentNode.style.setProperty("--mt-txt-max-lines",this.mtSettings.txtMaxLines),"0"!==this.mtSettings.previewMaxLines&&0!==this.mtSettings.previewMaxLines.length&&this.mtBodyNode.parentNode.style.setProperty("--mt-preview-max-lines",this.mtSettings.previewMaxLines)}#u(t){const e=this.mtBodyNode.getElementsByTagName("article");for(let i=0;i<t;i++)e[i].setAttribute("aria-setsize",t)}#c(t,e){this.mtBodyNode.insertAdjacentHTML("beforeend",this.#w(t,e))}#w(t,e){const i=Boolean(t.reblog),s=i?t.reblog:t,{url:a,created_at:n,replies_count:o,reblogs_count:r,favourites_count:l}=s,{avatar:d,url:m,username:h,display_name:c,emojis:p}=s.account,g='<a href="'+m+'" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank"><div class="mt-post-avatar-'+(i?"boosted":"standard")+'"><div class="mt-post-avatar-image-big mt-loading-spinner"><img src="'+d+'" alt="'+this.#f(h)+' avatar" loading="lazy" /></div>'+(i?'<div class="mt-post-avatar-image-small"><img src="'+t.account.avatar+'" alt="'+this.#f(t.account.username)+' avatar" loading="lazy" /></div>':"")+"</div></a>",u='<div class="mt-post-header-user"><a href="'+m+'" rel="nofollow noopener noreferrer" target="_blank"><bdi class="mt-post-header-user-name">'+(!this.mtSettings.hideEmojos&&c?this.#x(c,p):c||h)+"</bdi>"+(this.mtSettings.hideUserAccount?"":'<br /><span class="mt-post-header-user-account">@'+h+"@"+new URL(m).hostname+"</span>")+"</a></div>",v=this.#S(n),b='<div class="mt-post-header-date">'+(t.pinned?'<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="mt-post-pinned" aria-hidden="true"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"></path></svg>':"")+'<a href="'+a+'" rel="nofollow noopener noreferrer" target="_blank"><time datetime="'+n+'">'+v+"</time>"+(t.edited_at?" *":"")+"</a></div>",w="0"!==this.mtSettings.txtMaxLines?" truncate":"";let f="";const x=s.spoiler_text?s.spoiler_text:s.content;x&&(f='<div class="mt-post-txt'+w+'"><div class="mt-post-txt-wrapper">'+this.#y(x)+"</div></div>");const S=[...t.media_attachments,...t.reblog?.media_attachments||[]].map((t=>this.#L(t,s.sensitive))).join("");return'<article class="mt-post" aria-posinset="'+(e+1)+'" data-location="'+a+'" tabindex="0"><div class="mt-post-header">'+g+u+b+"</div>"+f+(S?`<div class="mt-post-media-wrapper">${S}</div>`:"")+(!this.mtSettings.hidePreviewLink&&t.card?this.#T(t.card):"")+(t.poll?'<div class="mt-post-poll '+(t.poll.expired?"mt-post-poll-expired":"")+'"><ul>'+t.poll.options.map((function(t){return"<li>"+t.title+"</li>"})).join("")+"</ul></div>":"")+(this.mtSettings.hideCounterBar?"":'<div class="mt-post-counter-bar">'+this.#N("replies",o)+this.#N("reblog",r)+this.#N("favorites",l)+"</div>")+"</article>"}#N(t,e){return`<div class="mt-post-counter-bar-${t}">${{replies:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M774.913-185.869V-356q0-56.609-35.891-92.5-35.892-35.891-92.5-35.891H258.045L411.435-331l-56 56.566L105.869-524l249.566-249.566 56 56.566-153.39 153.391h388.477q88.957 0 148.566 59.609 59.608 59.609 59.608 148v170.131h-79.783Z"></path></svg>',reblog:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M276.043-65.304 105.869-236.043l170.174-170.175 52.74 54.175-78.652 78.652h449.304v-160h75.261v235.261H250.131l78.652 78.087-52.74 54.74Zm-90.174-457.348v-235.261h524.565L631.782-836l52.74-54.74L854.696-720 684.522-549.26 631.782-604l78.652-78.652H261.13v160h-75.261Z"></path></svg>',favorites:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="m330.955-216.328 149.066-89 149.066 90.023-40.305-168.391 131.217-114.347-172.956-14.87L480-671.869l-67.043 158.521-172.956 14.305 131.427 113.796-40.473 168.919ZM212.086-50.608l70.652-305.305L45.52-561.305l312.645-26.579L480-876.176l121.835 288.292 312.645 26.579-237.218 205.392 71.217 305.306L480-213.173 212.086-50.607ZM480-433.87Z"></path></svg>'}[t]}${e}</div>`}#M(t,e){function i(t,e){let i=e.replace(/\s+/g,"").toLowerCase();return!(!["src","href","xlink:href"].includes(t)||!i.includes("javascript:")&&!i.includes("data:"))||(!!t.startsWith("on")||void 0)}function s(t){let e=t.attributes;for(let{name:s,value:a}of e)i(s,a)&&t.removeAttribute(s)}let a=(new DOMParser).parseFromString(t,"text/html").body||document.createElement("body");return function(t){let e=t.querySelectorAll("script");for(let t of e)t.remove()}(a),function t(e){let i=e.children;for(let e of i)s(e),t(e)}(a),e?a.childNodes:a.innerHTML}#y(t){let e=t;return e=this.#M(e,!1),e=this.#C(e),this.mtSettings.hideEmojos||(e=this.#x(e,this.fetchedData.emojos)),this.mtSettings.markdownBlockquote&&(e=this.#P(e,"<p>&gt;","</p>","<blockquote><p>","</p></blockquote>")),e}#C(t){let e=t.replaceAll('rel="tag"','rel="tag" target="_blank"');return e=e.replaceAll('class="u-url mention"','class="u-url mention" target="_blank"'),e}#P(t,e,i,s,a){if(t.includes(e)){const n=new RegExp(e+"(.*?)"+i,"gi");return t.replace(n,s+"$1"+a)}return t}#f(t){return(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}#x(t,e){if(t.includes(":")){for(const i of e){const e=new RegExp(`\\:${i.shortcode}\\:`,"g");t=t.replace(e,`<img src="${i.url}" class="mt-custom-emoji" alt="Emoji ${i.shortcode}" />`)}return t}return t}#S(t){const e=new Date(t);return new Intl.DateTimeFormat(this.mtSettings.dateFormatLocale,this.mtSettings.dateFormatOptions).format(e)}#L(t,e=!1){const i=t.type,s=e;let a="";const n='<button class="mt-btn-dark mt-btn-spoiler-media mt-btn-spoiler-media-hide"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="icon icon-eye-slash" aria-hidden="true"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"></path></svg></button><button class="mt-btn-dark mt-btn-spoiler-media mt-btn-spoiler-media-show">'+this.mtSettings.btnShowContent+"</button>";return"image"===i&&(a='<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" data-media-type="'+i+'" data-media-url-hd="'+t.url+'" data-media-alt-txt="'+(t.description?this.#f(t.description):"")+'" data-media-width-hd="'+t.meta.original.width+'" data-media-height-hd="'+t.meta.original.height+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?n:"")+'<img src="'+t.preview_url+'" alt="'+(t.description?this.#f(t.description):"")+'" loading="lazy" /></div>'),"audio"===i&&(a=t.preview_url?'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" data-media-type="'+i+'" data-media-url-hd="'+t.preview_url+'" data-media-alt-txt="'+(t.description?this.#f(t.description):"")+'" data-media-width-hd="'+t.meta.small.width+'" data-media-height-hd="'+t.meta.small.height+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?n:"")+'<audio controls src="'+t.url+'"></audio><img src="'+t.preview_url+'" alt="'+(t.description?this.#f(t.description):"")+'" loading="lazy" /></div>':'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+'" data-media-type="'+i+'">'+(s?n:"")+'<audio controls src="'+t.url+'"></audio></div>'),"video"!==i&&"gifv"!==i||(a=this.mtSettings.hideVideoPreview?'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+'" data-media-type="'+i+'" data-media-url-hd="'+t.url+'" data-media-alt-txt="'+(t.description?this.#f(t.description):"")+'" data-media-width-hd="'+t.meta.original.width+'" data-media-width-hd="'+t.meta.original.height+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?n:"")+'<video controls src="'+t.url+'" loop></video></div>':'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" data-media-type="'+i+'" data-media-url-hd="'+t.url+'" data-media-alt-txt="'+(t.description?this.#f(t.description):"")+'" data-media-width-hd="'+t.meta.original.width+'" data-media-height-hd="'+t.meta.original.height+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?n:"")+'<img src="'+t.preview_url+'" alt="'+(t.description?this.#f(t.description):"")+'" loading="lazy" /><button class="mt-btn-play" title="'+this.mtSettings.btnPlayVideoTxt+'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14"><path d="M9.5 7l-9 6.3V.7z"/></svg></button></div>'),a}#k(t,e){let i=document.createElement("dialog");i.id=t,i.classList.add("mt-dialog"),i.dataset.theme=this.mtContainerNode.getAttribute("data-theme"),i.innerHTML=e,document.body.prepend(i),i.showModal(),i.addEventListener("close",(()=>{document.body.removeChild(i)}))}#E(t){const e=Array.from(t.target.parentNode.parentNode.children).filter((t=>!t.classList.contains("mt-post-media-spoiler"))),i=e.indexOf(t.target.parentNode)+1;let s=[];e.forEach(((t,e)=>{let i="";i="gifv"===t.getAttribute("data-media-type")||"video"===t.getAttribute("data-media-type")?`\n        <video controls src="${t.getAttribute("data-media-url-hd")}" width="${t.getAttribute("data-media-width-hd")}" height="${t.getAttribute("data-media-height-hd")}" class="mt-carousel-media" style="max-width:${t.getAttribute("data-media-width-hd")}px; max-height:${t.getAttribute("data-media-height-hd")}px" loop>\n        </video>\n        `:`\n        <img src="${t.getAttribute("data-media-url-hd")}" width="${t.getAttribute("data-media-width-hd")}" height="${t.getAttribute("data-media-height-hd")}" class="mt-carousel-media mt-loading-spinner" alt="${t.getAttribute("data-media-alt-txt")}" style="max-width:${t.getAttribute("data-media-width-hd")}px; max-height:${t.getAttribute("data-media-height-hd")}px" dragabble="false" />\n        `;const a=`\n      <li class="mt-carousel-item">\n        <div id="mt-carousel-${e+1}" class="mt-carousel-media-wrapper" data-media-type="${t.getAttribute("data-media-type")}">\n          ${i}\n        </div>\n      </li>\n      `;s.push(a)}));const a=`\n    <div class="mt-carousel-header">\n      <form method="dialog">\n        <button id="mt-carousel-close" class="mt-btn-dark" title="${this.mtSettings.carouselCloseTxt}">\n          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">\n            <path fill-rule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z" fill="var(--mt-color-content-txt)"/>\n          </svg>\n        </button>\n      </form>\n    </div>\n\n    <div class="mt-carousel-body">\n      <ul id="mt-carousel-scroll" class="mt-carousel-scroll">\n        ${s.join("")}\n      </ul>\n    </div>\n\n    <button id="mt-carousel-prev" class="mt-carousel-prev" title="${this.mtSettings.carouselPrevTxt}" ${1===i?"hidden":""}>\n      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" aria-hidden="true">\n        <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" fill="var(--mt-color-content-txt)"></path>\n      </svg>\n    </button>\n\n    <button id="mt-carousel-next" class="mt-carousel-next" title="${this.mtSettings.carouselNextTxt}" ${i===e.length?"hidden":""}>\n      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" aria-hidden="true">\n        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" fill="var(--mt-color-content-txt)"></path>\n      </svg>\n    </button>\n  `;this.#k("mt-carousel",a),s.length>=2&&this.#$(e.length,i)}#$(t,e){let i=e;const s=document.getElementById("mt-carousel-scroll");let a=0,n=!1;const o=document.getElementById("mt-carousel-prev"),r=document.getElementById("mt-carousel-next"),l=(t,e="smooth")=>{document.getElementById("mt-carousel-"+t).scrollIntoView({behavior:e})};l(i,"instant");const d=()=>{clearTimeout(a),a=setTimeout((()=>{n&&(i=(()=>{const t=(s.scrollLeft+s.clientWidth)/s.clientWidth;return Math.round(t+Number.EPSILON)})(),m()),n=!0}),60)};s.addEventListener("scroll",d);const m=()=>{o.hidden=1===i,r.hidden=i===t},h=e=>{const s=e.target.closest("button")?.id;"mt-carousel-next"===s?(n=!1,++i,i>t&&(i=t),l(i),m()):"mt-carousel-prev"===s&&(n=!1,--i,i<1&&(i=1),l(i),m()),"mt-carousel-close"===s&&p()};document.addEventListener("click",h);const c=t=>{"Escape"!==t.key&&27!==t.keyCode||p()};document.addEventListener("keydown",c);const p=()=>{s.removeEventListener("scroll",d),document.removeEventListener("click",h),document.removeEventListener("keydown",c)}}#B(t){const e=t.target.closest("[data-media-type]"),i=e.dataset.mediaUrlHd;e.replaceChildren(),e.innerHTML=`<video controls src="${i}" autoplay loop></video>`}#H(t){const e=t.target,i=e.nextSibling;e.textContent==this.mtSettings.btnShowMore?(i.classList.remove("spoiler-txt-hidden"),i.classList.add("spoiler-txt-visible"),e.setAttribute("aria-expanded","true"),e.textContent=this.mtSettings.btnShowLess):(i.classList.remove("spoiler-txt-visible"),i.classList.add("spoiler-txt-hidden"),e.setAttribute("aria-expanded","false"),e.textContent=this.mtSettings.btnShowMore)}#A(t){const e=t.target;e.classList.contains("mt-btn-spoiler-media-show")?e.parentNode.classList.remove("mt-post-media-spoiler"):e.parentNode.classList.add("mt-post-media-spoiler")}#T(t){let e="";if("0"!==this.mtSettings.previewMaxLines&&t.description){e='<span class="mt-post-preview-description'+(0!==this.mtSettings.previewMaxLines.length?" truncate":"")+'">'+this.#_(t.description)+"</span>"}return'<a href="'+t.url+'" class="mt-post-preview" target="_blank" rel="noopener noreferrer">'+(t.image?'<div class="mt-post-preview-image '+this.mtSettings.spinnerClass+'"><img src="'+t.image+'" alt="'+this.#f(t.image_description)+'" loading="lazy" /></div>':'<div class="mt-post-preview-noImage">📄</div>')+'</div><div class="mt-post-preview-content">'+(t.provider_name?'<span class="mt-post-preview-provider">'+this.#_(t.provider_name)+"</span>":"")+'<span class="mt-post-preview-title">'+t.title+"</span>"+e+(t.author_name?'<span class="mt-post-preview-author">'+this.#_(t.author_name)+"</span>":"")+"</div></a>"}#_(t){return(new DOMParser).parseFromString(t,"text/html").body.textContent}#b(){let t="",e="";if(this.mtSettings.btnSeeMore){let e="";"profile"===this.mtSettings.timelineType?this.mtSettings.profileName?e=this.mtSettings.profileName:this.#o("Please check your <strong>profileName</strong> value","⚠️"):"hashtag"===this.mtSettings.timelineType?e="tags/"+this.mtSettings.hashtagName:"local"===this.mtSettings.timelineType&&(e="public/local"),t=`\n          <a class="mt-btn-violet btn-see-more" href="${this.mtSettings.instanceUrl}/${this.#f(e)}" rel="nofollow noopener noreferrer" target="_blank">\n            ${this.mtSettings.btnSeeMore}\n          </a>`}if(this.mtSettings.btnReload&&(e=`\n          <button class="mt-btn-violet btn-refresh">\n            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 3v5m0 0h-5m5 0l-3-2.708C16.408 3.867 14.305 3 12 3a9 9 0 1 0 0 18c4.283 0 7.868-2.992 8.777-7" stroke="var(--mt-color-btn-txt)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n            </svg>\n              ${this.mtSettings.btnReload}\n          </button>`),this.mtBodyNode.parentNode.insertAdjacentHTML("beforeend",'<div class="mt-footer">'+t+e+"</div>"),this.mtSettings.btnReload){this.mtContainerNode.getElementsByClassName("btn-refresh")[0].addEventListener("click",(()=>{this.mtUpdate()}))}}#v(){this.mtBodyNode.addEventListener("click",(t=>{const e=t.target,i=e.localName,s=e.parentNode;("article"==i||"article"==e.offsetParent?.localName||this.mtSettings.disableCarousel&&"image"===s.getAttribute("data-media-type"))&&this.#D(t),e.classList.contains("mt-btn-spoiler-txt")&&this.#H(t),e.classList.contains("mt-btn-spoiler-media")&&this.#A(t),this.mtSettings.disableCarousel||"img"!=i||"image"!==s.getAttribute("data-media-type")&&"audio"!==s.getAttribute("data-media-type")||this.#E(t),("mt-btn-play"==e.className||"svg"==i&&"mt-btn-play"==s.className||"path"==i&&"mt-btn-play"==s.parentNode.className||"img"==i&&("video"===s.getAttribute("data-media-type")||"gifv"===s.getAttribute("data-media-type")))&&this.#B(t)})),this.mtBodyNode.addEventListener("keydown",(t=>{const e=t.target.localName;"Enter"===t.key&&"article"==e&&this.#D(t)}))}#D(t){const e=t.target.closest(".mt-post")?.dataset.location;if(!e)return;const i=t.target.localName;if("a"===i||"span"===i||"button"===i||"bdi"===i||"time"===i)return;const s=t.target.className;if("mt-post-media-spoiler"===s||"mt-post-preview-noImage"===s)return;const a=t.target.parentNode?.className;"mt-post-avatar-image-big"!==a&&"mt-post-avatar-image-small"!==a&&"mt-post-header-user-name"!==a&&"mt-post-preview-image"!==a&&"mt-post-preview"!==a&&window.open(e,"_blank","noopener")}#p(){const t=e=>{e.target.parentNode.classList.remove(this.mtSettings.spinnerClass),e.target.removeEventListener("load",t),e.target.removeEventListener("error",t)};this.mtBodyNode.querySelectorAll(`.${this.mtSettings.spinnerClass} > img`).forEach((e=>{e.addEventListener("load",t),e.addEventListener("error",t)}))}#o(t,e){const i=e||"❌";throw this.mtBodyNode.innerHTML=`\n      <div class="mt-error">\n        <span class="mt-error-icon">${i}</span>\n        <strong>Oops, something's happened:</strong>\n        <div class="mt-error-message">${t}</div>\n      </div>`,this.mtBodyNode.setAttribute("role","none"),new Error("Stopping the script due to an error building the timeline.")}}}));
