/**
 * Mastodon embed timeline
 * @author idotj
 * @version 4.2.0
 * @url https://gitlab.com/idotj/mastodon-embed-timeline
 * @license GNU AGPLv3
 */
class t{constructor(t={}){this.defaultSettings={mtContainerId:"mt-container",instanceUrl:"https://mastodon.social",timelineType:"local",userId:"",profileName:"",hashtagName:"",spinnerClass:"mt-loading-spinner",defaultTheme:"auto",maxNbPostFetch:"20",maxNbPostShow:"20",hideUnlisted:!1,hideReblog:!1,hideReplies:!1,hideVideoPreview:!1,hidePreviewLink:!1,hideEmojos:!1,markdownBlockquote:!1,hideCounterBar:!1,txtMaxLines:"0",btnShowMore:"SHOW MORE",btnShowLess:"SHOW LESS",btnShowContent:"SHOW CONTENT",btnSeeMore:"See more posts at Mastodon",btnReload:"Refresh",insistSearchContainer:!1,insistSearchContainerTime:"3000"},this.mtSettings={...this.defaultSettings,...t},this.mtContainerNode="",this.mtBodyNode="",this.fetchedData={},this.#t((()=>{this.#e()}))}#t(t){"undefined"!=typeof document&&"complete"===document.readyState?t():"undefined"!=typeof document&&"complete"!==document.readyState&&document.addEventListener("DOMContentLoaded",t())}#e(){const t=()=>{this.mtContainerNode=document.getElementById(this.mtSettings.mtContainerId),this.mtBodyNode=this.mtContainerNode.getElementsByClassName("mt-body")[0],this.#s(),this.#i("newTimeline")};if(this.mtSettings.insistSearchContainer){const e=performance.now(),s=()=>{if(document.getElementById(this.mtSettings.mtContainerId))t();else{performance.now()-e<this.mtSettings.insistSearchContainerTime?requestAnimationFrame(s):console.error(`Impossible to find the <div> container with id: "${this.mtSettings.mtContainerId}" after several attempts for ${this.mtSettings.insistSearchContainerTime/1e3} seconds`)}};s()}else document.getElementById(this.mtSettings.mtContainerId)?t():console.error(`Impossible to find the <div> container with id: "${this.mtSettings.mtContainerId}". Please try to add the option 'insistSearchContainer: true' when initializing the script`)}mtUpdate(){this.#t((()=>{this.mtBodyNode.replaceChildren(),this.mtBodyNode.insertAdjacentHTML("afterbegin",'<div class="mt-loading-spinner"></div>'),this.#i("updateTimeline")}))}mtColorTheme(t){this.#t((()=>{this.mtContainerNode.setAttribute("data-theme",t)}))}#s(){if("auto"===this.mtSettings.defaultTheme){let t=window.matchMedia("(prefers-color-scheme: dark)");t.matches?this.mtColorTheme("dark"):this.mtColorTheme("light"),t.addEventListener("change",(t=>{t.matches?this.mtColorTheme("dark"):this.mtColorTheme("light")}))}else this.mtColorTheme(this.mtSettings.defaultTheme)}#a(){return new Promise(((t,e)=>{let s={};this.mtSettings.instanceUrl?"profile"===this.mtSettings.timelineType?this.mtSettings.userId?s.timeline=`${this.mtSettings.instanceUrl}/api/v1/accounts/${this.mtSettings.userId}/statuses?limit=${this.mtSettings.maxNbPostFetch}`:this.#o("Please check your <strong>userId</strong> value","⚠️"):"hashtag"===this.mtSettings.timelineType?this.mtSettings.hashtagName?s.timeline=`${this.mtSettings.instanceUrl}/api/v1/timelines/tag/${this.mtSettings.hashtagName}?limit=${this.mtSettings.maxNbPostFetch}`:this.#o("Please check your <strong>hashtagName</strong> value","⚠️"):"local"===this.mtSettings.timelineType?s.timeline=`${this.mtSettings.instanceUrl}/api/v1/timelines/public?local=true&limit=${this.mtSettings.maxNbPostFetch}`:this.#o("Please check your <strong>timelineType</strong> value","⚠️"):this.#o("Please check your <strong>instanceUrl</strong> value","⚠️"),this.mtSettings.hideEmojos||(s.emojos=this.mtSettings.instanceUrl+"/api/v1/custom_emojis");const i=Object.entries(s).map((([t,s])=>async function(t){const e=await fetch(t);if(!e.ok)throw new Error("Failed to fetch the following Url: <br>"+t+"<hr>Error status: "+e.status+"<hr>Error message: "+e.statusText);return await e.json()}(s).then((e=>({[t]:e}))).catch((i=>(e(new Error("Something went wrong fetching data from: "+s)),this.#o(i.message),{[t]:[]})))));Promise.all(i).then((e=>{this.mtSettings.fetchedData=e.reduce(((t,e)=>({...t,...e})),{}),t()}))}))}async#i(t){await this.#a(),this.mtBodyNode.replaceChildren();let e=0;for(let t in this.mtSettings.fetchedData.timeline)("public"==this.mtSettings.fetchedData.timeline[t].visibility||!this.mtSettings.hideUnlisted&&"unlisted"==this.mtSettings.fetchedData.timeline[t].visibility)&&(this.mtSettings.hideReblog&&this.mtSettings.fetchedData.timeline[t].reblog||this.mtSettings.hideReplies&&this.mtSettings.fetchedData.timeline[t].in_reply_to_id||e<this.mtSettings.maxNbPostShow&&(this.#n(this.mtSettings.fetchedData.timeline[t],Number(t)),e++));if(""===this.mtBodyNode.innerHTML){const t="No posts to show <hr/>"+(this.mtSettings.fetchedData.timeline?.length||0)+" posts have been fetched from the server <hr/>This may be due to an incorrect configuration in the parameters or to filters applied (to hide certains type of posts)";this.#o(t,"📭")}else"newTimeline"===t?(this.#r(),this.#l(),this.#m()):"updateTimeline"===t?this.#r():this.#o("The function buildTimeline() was expecting a param")}#n(t,e){this.mtBodyNode.insertAdjacentHTML("beforeend",this.#d(t,e))}#d(t,e){let s,i,a,o,n,r,l,m,d;t.reblog?(o=t.reblog.url,s='<a href="'+t.reblog.account.url+'" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank"><div class="mt-post-avatar-boosted"><div class="mt-post-avatar-image-big mt-loading-spinner"><img src="'+t.reblog.account.avatar+'" alt="'+this.#c(t.reblog.account.username)+' avatar" loading="lazy" /></div><div class="mt-post-avatar-image-small"><img src="'+t.account.avatar+'" alt="'+this.#c(t.account.username)+' avatar" loading="lazy" /></div></div></a>',a=t.reblog.account.display_name?t.reblog.account.display_name:t.reblog.account.username,this.mtSettings.hideEmojos||(a=this.#h(a,this.mtSettings.fetchedData.emojos)),i='<div class="mt-post-header-user"><a href="'+t.reblog.account.url+'" rel="nofollow noopener noreferrer" target="_blank">'+a+'<span class="visually-hidden"> account</span></a></div>',n=t.reblog.created_at,d=t.reblog.replies_count,m=t.reblog.reblogs_count,l=t.reblog.favourites_count):(o=t.url,s='<a href="'+t.account.url+'" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank"><div class="mt-post-avatar-standard"><div class="mt-post-avatar-image-big mt-loading-spinner"><img src="'+t.account.avatar+'" alt="'+this.#c(t.account.username)+' avatar" loading="lazy" /></div></div></a>',a=t.account.display_name?t.account.display_name:t.account.username,this.mtSettings.hideEmojos||(a=this.#h(a,this.mtSettings.fetchedData.emojos)),i='<div class="mt-post-header-user"><a href="'+t.account.url+'" rel="nofollow noopener noreferrer" target="_blank">'+a+'<span class="visually-hidden"> account</span></a></div>',n=t.created_at,d=t.replies_count,m=t.reblogs_count,l=t.favourites_count),r=this.#p(n);const c='<div class="mt-post-header-date"><a href="'+o+'" rel="nofollow noopener noreferrer" target="_blank"><time datetime="'+n+'">'+r+"</time></a></div>";let h="";"0"!==this.mtSettings.txtMaxLines&&(h=" truncate",this.mtBodyNode.parentNode.style.setProperty("--mt-txt-max-lines",this.mtSettings.txtMaxLines));let p="";p=""!==t.spoiler_text?'<div class="mt-post-txt">'+t.spoiler_text+' <button type="button" class="mt-btn-dark mt-btn-spoiler" aria-expanded="false">'+this.mtSettings.btnShowMore+'</button><div class="spoiler-txt-hidden">'+this.#g(t.content)+"</div></div>":t.reblog&&""!==t.reblog.content&&""!==t.reblog.spoiler_text?'<div class="mt-post-txt">'+t.reblog.spoiler_text+' <button type="button" class="mt-btn-dark mt-btn-spoiler" aria-expanded="false">'+this.mtSettings.btnShowMore+'</button><div class="spoiler-txt-hidden">'+this.#g(t.reblog.content)+"</div></div>":t.reblog&&""!==t.reblog.content&&""===t.reblog.spoiler_text?'<div class="mt-post-txt'+h+'"><div class="mt-post-txt-wrapper">'+this.#g(t.reblog.content)+"</div></div>":'<div class="mt-post-txt'+h+'"><div class="mt-post-txt-wrapper">'+this.#g(t.content)+"</div></div>";let g=[];if(t.media_attachments.length>0)for(let e in t.media_attachments)g.push(this.#u(t.media_attachments[e],t.sensitive));if(t.reblog&&t.reblog.media_attachments.length>0)for(let e in t.reblog.media_attachments)g.push(this.#u(t.reblog.media_attachments[e],t.reblog.sensitive));let u="";!this.mtSettings.hidePreviewLink&&t.card&&(u=this.#v(t.card));let v="";if(t.poll){let e="";for(let s in t.poll.options)e+="<li>"+t.poll.options[s].title+"</li>";v='<div class="mt-post-poll '+(t.poll.expired?"mt-post-poll-expired":"")+'"><ul>'+e+"</ul></div>"}let b="";if(!this.mtSettings.hideCounterBar){b='<div class="mt-post-counter-bar">'+('<div class="mt-post-counter-bar-replies"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M774.913-185.869V-356q0-56.609-35.891-92.5-35.892-35.891-92.5-35.891H258.045L411.435-331l-56 56.566L105.869-524l249.566-249.566 56 56.566-153.39 153.391h388.477q88.957 0 148.566 59.609 59.608 59.609 59.608 148v170.131h-79.783Z"></path></svg>'+d+"</div>")+('<div class="mt-post-counter-bar-reblog"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="M276.043-65.304 105.869-236.043l170.174-170.175 52.74 54.175-78.652 78.652h449.304v-160h75.261v235.261H250.131l78.652 78.087-52.74 54.74Zm-90.174-457.348v-235.261h524.565L631.782-836l52.74-54.74L854.696-720 684.522-549.26 631.782-604l78.652-78.652H261.13v160h-75.261Z"></path></svg>'+m+"</div>")+('<div class="mt-post-counter-bar-favorites"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" aria-hidden="true"><path d="m330.955-216.328 149.066-89 149.066 90.023-40.305-168.391 131.217-114.347-172.956-14.87L480-671.869l-67.043 158.521-172.956 14.305 131.427 113.796-40.473 168.919ZM212.086-50.608l70.652-305.305L45.52-561.305l312.645-26.579L480-876.176l121.835 288.292 312.645 26.579-237.218 205.392 71.217 305.306L480-213.173 212.086-50.607ZM480-433.87Z"></path></svg>'+l+"</div>")+"</div>"}return'<article class="mt-post" aria-posinset="'+(e+1)+'" aria-setsize="'+this.mtSettings.maxNbPostFetch+'" data-location="'+o+'" tabindex="0"><div class="mt-post-header">'+s+i+c+"</div>"+p+g.join("")+u+v+b+"</article>"}#g(t){let e=t;return e=this.#b(e),this.mtSettings.hideEmojos||(e=this.#h(e,this.mtSettings.fetchedData.emojos)),this.mtSettings.markdownBlockquote&&(e=this.#S(e,"<p>&gt;","</p>","<blockquote><p>","</p></blockquote>")),e}#b(t){let e=t.replaceAll('rel="tag"','rel="tag" target="_blank"');return e=e.replaceAll('class="u-url mention"','class="u-url mention" target="_blank"'),e}#S(t,e,s,i,a){if(t.includes(e)){const o=new RegExp(e+"(.*?)"+s,"gi");return t.replace(o,i+"$1"+a)}return t}#c(t){return(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}#h(t,e){if(t.includes(":")){for(const s of e){const e=new RegExp(`\\:${s.shortcode}\\:`,"g");t=t.replace(e,`<img src="${s.url}" class="mt-custom-emoji" alt="Emoji ${s.shortcode}" />`)}return t}return t}#p(t){const e=new Date(t);return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]+" "+e.getDate()+", "+e.getFullYear()}#u(t,e){const s=e||!1,i=t.type;let a="";return"image"===i&&(a='<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?'<button class="mt-btn-dark mt-btn-spoiler">'+this.mtSettings.btnShowContent+"</button>":"")+'<img src="'+t.preview_url+'" alt="'+(t.description?this.#c(t.description):"")+'" loading="lazy" /></div>'),"audio"===i&&(a=t.preview_url?'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?'<button class="mt-btn-dark mt-btn-spoiler">'+this.mtSettings.btnShowContent+"</button>":"")+'<audio controls src="'+t.url+'"></audio><img src="'+t.preview_url+'" alt="'+(t.description?this.#c(t.description):"")+'" loading="lazy" /></div>':'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+'">'+(s?'<button class="mt-btn-dark mt-btn-spoiler">'+this.mtSettings.btnShowContent+"</button>":"")+'<audio controls src="'+t.url+'"></audio></div>'),"video"!==i&&"gifv"!==i||(a=this.mtSettings.hideVideoPreview?'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?'<button class="mt-btn-dark mt-btn-spoiler">'+this.mtSettings.btnShowContent+"</button>":"")+'<video controls src="'+t.url+'"></video></div>':'<div class="mt-post-media '+(s?"mt-post-media-spoiler ":"")+this.mtSettings.spinnerClass+'" data-video-url="'+t.url+'" style="padding-top: calc(100%/'+t.meta.small.aspect+')">'+(s?'<button class="mt-btn-dark mt-btn-spoiler">'+this.mtSettings.btnShowContent+"</button>":"")+'<img src="'+t.preview_url+'" alt="'+(t.description?this.#c(t.description):"")+'" loading="lazy" /><button class="mt-post-media-play-icon" title="Load video"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14"><path d="M9.5 7l-9 6.3V.7z"/></svg></button></div>'),a}#f(t){const e=t.target.closest("[data-video-url]"),s=e.dataset.videoUrl;e.replaceChildren(),e.innerHTML='<video controls src="'+s+'" autoplay></video>'}#w(t){const e=t.target.nextSibling;"img"===e.localName||"audio"===e.localName||"video"===e.localName?(t.target.parentNode.classList.remove("mt-post-media-spoiler"),t.target.style.display="none"):(e.classList.contains("spoiler-txt-hidden")||e.classList.contains("spoiler-txt-visible"))&&(t.target.textContent==this.mtSettings.btnShowMore?(e.classList.remove("spoiler-txt-hidden"),e.classList.add("spoiler-txt-visible"),t.target.setAttribute("aria-expanded","true"),t.target.textContent=this.mtSettings.btnShowLess):(e.classList.remove("spoiler-txt-visible"),e.classList.add("spoiler-txt-hidden"),t.target.setAttribute("aria-expanded","false"),t.target.textContent=this.mtSettings.btnShowMore))}#v(t){return'<a href="'+t.url+'" class="mt-post-preview" target="_blank" rel="noopener noreferrer">'+(t.image?'<div class="mt-post-preview-image '+this.mtSettings.spinnerClass+'"><img src="'+t.image+'" alt="'+this.#c(t.image_description)+'" loading="lazy" /></div>':'<div class="mt-post-preview-noImage">📄</div>')+'</div><div class="mt-post-preview-content">'+(t.provider_name?'<span class="mt-post-preview-provider">'+this.#N(t.provider_name)+"</span>":"")+'<span class="mt-post-preview-title">'+t.title+"</span>"+(t.author_name?'<span class="mt-post-preview-author">'+this.#N(t.author_name)+"</span>":"")+"</div></a>"}#N(t){return(new DOMParser).parseFromString(t,"text/html").body.textContent}#m(){if(this.mtSettings.btnSeeMore||this.mtSettings.btnReload){this.mtBodyNode.parentNode.insertAdjacentHTML("beforeend",'<div class="mt-footer"></div>');const t=this.mtContainerNode.getElementsByClassName("mt-footer")[0];if(this.mtSettings.btnSeeMore){let e="";"profile"===this.mtSettings.timelineType?this.mtSettings.profileName?e=this.mtSettings.profileName:this.#o("Please check your <strong>profileName</strong> value","⚠️"):"hashtag"===this.mtSettings.timelineType?e="tags/"+this.mtSettings.hashtagName:"local"===this.mtSettings.timelineType&&(e="public/local");const s='<a class="mt-btn-violet btn-see-more" href="'+this.mtSettings.instanceUrl+"/"+this.#c(e)+'" rel="nofollow noopener noreferrer" target="_blank">'+this.mtSettings.btnSeeMore+"</a>";t.insertAdjacentHTML("beforeend",s)}if(this.mtSettings.btnReload){const e='<button class="mt-btn-violet btn-refresh"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 3v5m0 0h-5m5 0l-3-2.708C16.408 3.867 14.305 3 12 3a9 9 0 1 0 0 18c4.283 0 7.868-2.992 8.777-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+this.mtSettings.btnReload+"</button>";t.insertAdjacentHTML("beforeend",e);this.mtContainerNode.getElementsByClassName("btn-refresh")[0].addEventListener("click",(()=>{this.mtUpdate()}))}}}#l(){this.mtBodyNode.addEventListener("click",(t=>{("article"==t.target.localName||"article"==t.target.offsetParent?.localName||"img"==t.target.localName&&!t.target.parentNode.getAttribute("data-video-url"))&&this.#y(t),"button"==t.target.localName&&t.target.classList.contains("mt-btn-spoiler")&&this.#w(t),("mt-post-media-play-icon"==t.target.className||"svg"==t.target.localName&&"mt-post-media-play-icon"==t.target.parentNode.className||"path"==t.target.localName&&"mt-post-media-play-icon"==t.target.parentNode.parentNode.className||"img"==t.target.localName&&t.target.parentNode.getAttribute("data-video-url"))&&this.#f(t)})),this.mtBodyNode.addEventListener("keydown",(t=>{"Enter"===t.key&&"article"==t.target.localName&&this.#y(t)}))}#y(t){const e=t.target.closest(".mt-post").dataset.location;"a"!==t.target.localName&&"span"!==t.target.localName&&"button"!==t.target.localName&&"time"!==t.target.localName&&"mt-post-preview-noImage"!==t.target.className&&"mt-post-avatar-image-big"!==t.target.parentNode.className&&"mt-post-avatar-image-small"!==t.target.parentNode.className&&"mt-post-preview-image"!==t.target.parentNode.className&&"mt-post-preview"!==t.target.parentNode.className&&e&&window.open(e,"_blank","noopener")}#r(){const t=e=>{e.target.parentNode.classList.remove(this.mtSettings.spinnerClass),e.target.removeEventListener("load",t),e.target.removeEventListener("error",t)};this.mtBodyNode.querySelectorAll(`.${this.mtSettings.spinnerClass} > img`).forEach((e=>{e.addEventListener("load",t),e.addEventListener("error",t)}))}#o(t,e){const s=e||"❌";throw this.mtBodyNode.innerHTML='<div class="mt-error"><span class="mt-error-icon">'+s+'</span><br/><strong>Oops, something\'s happened:</strong><br/><div class="mt-error-message">'+t+"</div></div>",this.mtBodyNode.setAttribute("role","none"),new Error("Stopping the script due to an error building the timeline.")}}export{t as Init};
