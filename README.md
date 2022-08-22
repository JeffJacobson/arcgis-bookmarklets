# ArcGIS Bookmarklets

<!-- 🚨⚠ WARNING: DO NOT EDIT THE README.md FILE. MAKE ALL CHANGES TO README.template.md, as README.md will be overwritten by an automated process. -->

A bookmarklet that enhances the ArcGIS REST query page with various quality-of-life changes.

* Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
* Gives the user the option of not setting query parameters that they don't need.
  * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
  * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
* Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
* Submitting the form will now open the results in a new browser tab rather than replacing the current one.
* Adds a reset button to the form.
* Spatial Reference input changes (`outSR` and `inSR`)
  * Adds suggestions to the text input via [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) elements. Includes the following options. (Descriptions come from <https://epsg.io>.)
    * [4326]: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS"
    * [3857]: "WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"
    * [2927]: "NAD83(HARN) / Washington South (ftUS)"

## Future ideas

The following are ideas for enhancements that have not yet been implemented.

* Make it easier for users to specify geometry parameters
  * [ ] Allow them to select a point using [epsg.io's "Get position on a map" feature](https://epsg.io/map#srs=2927), which supports various SRs.
* [ ] Add [form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#validating_forms_using_javascript) using the [Constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation).
  * We can't simply mark the `where` input control as required. While `where` is *usually* required for a query, but not *always*, depending on what other parameters the user has specified.
  * [ ] Validate geometry input is in the correct format.

[4326]:https://epsg.io/4326
[2927]:https://epsg.io/2927
[3857]:https://epsg.io/3857

## How to use

1. Go to <https://jeffjacobson.github.io/arcgis-bookmarklets> and drag a link to your bookmarks toolbar

Alternatively,

1. To use, create a new bookmark in your web browser and enter the text below as its URL.
2. Each time you visit an ArcGIS Server query page, you can click this bookmarklet to enhance it.

<!-- The bookmarklet URLs will be written below -->

## arcgis-layer-query-form-enhancements

A bookmarklet that enhances the ArcGIS REST query page with various quality-of-life changes.

* Field names are now selected via a multi-option select element rather than requiring the user to type a comma-separated list of field names that they have to look up themselves.
* Gives the user the option of not setting query parameters that they don't need.
  * Added "None" option to select elements (drop-downs) for non-required parameters. (E.g., "f" is a required parameter for the query, so it does not get a "None" option in its select element.)
  * Similarly, "true" and "false" radio buttons gain a third option which allows the user to leave the setting unset rather than be forced to choose a value.
* Adds a link to the top of the page that will clean-up the URL by removing search parameters from the URL that have no value.
* Submitting the form will now open the results in a new browser tab rather than replacing the current one.
* Adds a reset button to the form.
* Spatial Reference input changes (`outSR` and `inSR`)
  * Adds suggestions to the text input via [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) elements. Includes the following options. (Descriptions come from <https://epsg.io>.)
    * [4326]: "WGS 84 -- WGS84 - World Geodetic System 1984, used in GPS"
    * [3857]: "WGS 84 / Pseudo-Mercator -- Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"
    * [2927]: "NAD83(HARN) / Washington South (ftUS)"

[4326]:https://epsg.io/4326
[2927]:https://epsg.io/2927
[3857]:https://epsg.io/3857
```javascript
javascript:(()=>{var p="../../../../../../sdk/rest/index.html",u=`${p}#/Query_Map_Service_Layer/02ss0000000r000000/`,c=null,f=new Map([[2927,"NAD83(HARN) / Washington South (ftUS)"],[4326,"WGS 84 \u2013 WGS84 - World Geodetic System 1984, used in GPS"],[3857,"WGS 84 / Pseudo-Mercator \u2013 Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI"]]);function h(n=f){let e=document.createElement("datalist");e.id="srdatalist";let t=document.createDocumentFragment();for(let[o,r]of n){let a=document.createElement("option");a.value=o.toString(),a.text=a.label=`${o}: ${r}`,t.appendChild(a)}return e.appendChild(t),e}function y(n,e,t=["inSR","outSR"]){let o=t.map(s=>`input[type=text][name='${s}']`).join(","),r=n.querySelectorAll(o);e||(e=h(),n.appendChild(e));let a=typeof e=="string"?e:e.id;for(let s of r)s.setAttribute("list",a)}function m(n,e){console.group(`scroll to span with ${e}`);try{let t=n.querySelectorAll("td:first-child>span.usertext");console.debug("matching spans",t);let o=Array.from(t).filter(r=>r.textContent===e);console.debug(`matching spans with ${e}`,o),o.length>0&&o[0].parentElement?.scrollIntoView()}catch(t){throw console.error(t),t}finally{console.groupEnd()}}function E(n){console.group("get help for param");try{let e=this.dataset.param;e?(!c||c.closed?(c=open(this.href,this.target),c?.addEventListener("load",function(t){this.setTimeout(()=>m(this.document,e),1e3)},{passive:!0,capture:!1})):(m(c.document,e),c.focus()),n.preventDefault()):console.warn("could not access paramName")}catch(e){throw console.error(e),e}finally{console.groupEnd()}}function g(n){let e=n.querySelectorAll("label[for]"),t="\u2753";function o(s){let d=s.htmlFor||s.dataset.htmlFor,i=document.createElement("a");i.href=u,i.target="help",i.dataset.param=d,i.text=t,s.append(i),i.addEventListener("click",E)}let r="td>label:first-child>input[type=radio][name]",a=Array.from(n.querySelectorAll(r),s=>{let d=s.name,i=s.parentElement?.parentElement?.previousElementSibling;return i.dataset.htmlFor=d,i});for(let s of a)o(s);e.forEach(o)}function L(n=document.forms[0]){console.group("add 'none' option to selects");let e=["f"].map(r=>`[name='${r}']`).join(","),t=n.querySelectorAll(`select:not(${e})`),o="Unset";console.log("selects",t);for(let r of t){let a=document.createElement("option");a.value="",a.label=o,a.textContent=o,a.defaultSelected=!0,r.appendChild(a),console.log("option added",a)}console.groupEnd()}function T(n=document.forms[0]){let e=Array.from(n.querySelectorAll("input[type=radio][value='false']")).filter(t=>!t.nextElementSibling);if(!!e)for(let t of e){let o=document.createElement("input");o.type="radio",o.value="",o.name=t.name,o.defaultChecked=t.defaultChecked;let r=document.createElement("label");if(r.append(o,document.createTextNode("Unset")),t.parentElement&&t.parentElement.parentElement)t.parentElement.parentElement.append(r);else throw new ReferenceError("expected parent elements not found")}}async function S(){let n=/^.+\/(?:(?:Map)|(?:Feature))Server\/(?<layerId>\d+)\b/i,e=location.href.match(n);if(!e)throw new Error("Invalid map service URL format.");let t=new URL(e[0]),o=e.groups.layerId,r=sessionStorage.getItem(o);return r||(t.searchParams.set("f","json"),r=await(await fetch(t.toString())).text(),sessionStorage.setItem(o,r)),JSON.parse(r)}function F(n){let e=/^esriFieldType/i;return n.replace(e,"")}function*I(n){for(let e of n){if(e.type==="esriFieldTypeGeometry")continue;let t=document.createElement("option");t.value=e.name,t.classList.add(e.type);let o=F(e.type);e.alias&&e.alias!==e.name?t.label=`${e.alias} (${e.name}) (${o})`:t.label=`${e.name} (${o})`,t.text=t.label,yield t}}function b(...n){let e=document.createElement("select");return e.id="outFieldsSelect",e.multiple=!0,e.append(...I(n)),e}function w(n,...e){let t=n.querySelectorAll("input[type=text][name$='Fields'],input[type=text][name$='FieldsForStatistics']");if(!!t)for(let o of t){o.type="hidden";let r=b(...e);o.parentElement.append(r),r.addEventListener("change",function(a){let s=Array.from(this.selectedOptions,d=>d.value).join(",");o.value=s})}}function M(n){let e=new URL(location.href),t=Array.from(e.searchParams.entries()).filter(([r,a])=>a!==""&&a!=="false"&&a!=="esriDefault"),o=new URLSearchParams;for(let[r,a]of t)o.append(r,a);e=new URL(e.href.replace(/\?.+$/,"")),e.search=o.toString(),history.replaceState(null,"",e),n.preventDefault()}function H(n){let e=document.createElement("a");e.href="#",e.text="Cleanup URL",e.addEventListener("click",M);let t=document.createElement("p");t.append(e),n.prepend(t)}function v(n){function e(){let t=n.querySelector("button[type=reset],input[type=reset]");t||(t=document.createElement("button"),t.type="reset",t.innerText="Reset",n.querySelector("[type=submit]").parentElement.appendChild(t))}e(),n.addEventListener("submit",function(t){let o=t.submitter,r=/(?:(?:GET)|(?:POST))/gi,a=o?.getAttribute("value")?.match(r);this.method=a?a[0].toLowerCase():"",this.target="_blank"})}function x(n){let e=/(?<start>\d+)(?:,\s*(?<end>\d+))?/,t=n.querySelector("input[name='time']");return t&&(t.pattern=e.source),t}var l=document.forms[0];l.dataset.enhanced||(l.where.placeholder='Use "1=1" to query all records.',y(l),g(l),console.debug("form",l),H(l),L(l),T(l),v(l),x(l),S().then(n=>{if(!n.fields)throw new TypeError("Expected an layer to have an array of fields.");w(l,...n.fields)}),l.dataset.enhanced="true");})();
```

## get-coords-from-epsg-io

Extracts coordinate information from an epsg.io page.
```javascript
javascript:(()=>{function s(o){console.group("create table");let n=document.createElement("table");console.log("coordsMap",o);for(let[t,r]of o){if(console.log(`current key is ${t}`,r),!r){console.warn(`No coordinates for ${t}`);continue}let e=n.insertRow();console.log("row",e);let a=document.createElement("th");a.textContent=t,e.append(a),console.log("row",e);let c=e.insertCell(),l=document.createElement("pre");l.textContent=JSON.stringify(r),c.append(l),console.log(e)}return console.groupEnd(),n}var i=/-?\d+(?:\.\d+)/g;function*d(...o){for(let n of o){let t=n.querySelector(".caption")?.textContent?.replace(/:$/,"")||null,r=[...n.childNodes].filter(e=>e instanceof Text||e instanceof HTMLSpanElement).map(e=>{let a=e.textContent?.matchAll(i);if(!a)return null;let c=new Array;for(let l of a)c.push(l);return c.flat()}).filter(e=>!!e).map(e=>e?.map(parseFloat)).flat();r.length&&t&&(yield[t,r])}}function m(){let o=document.body.querySelectorAll("#mini-map ~ p");if(!o)throw new TypeError("No elements matching the specified selector were found.");return new Map([...d(...o)])}function u(o){let n=s(o);console.log(`table has ${n.rows.length} rows`);let t=document.body.querySelector("#mini-map")?.parentElement;t?t.append(n):console.warn("Couldn't find target node")}var p=m();u(p);console.log(p);})();
```
