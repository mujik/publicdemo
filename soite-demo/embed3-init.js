(function () {
	"use strict";

	var REALM_ID = "4he2khen00pj8";
	var CONFIG_KEY = "site/4he2khen00pj8/crcf00nkfe006.json";
	var CONTAINER_ID = "ninchat-soite";

	function ensureContainer(id) {
		var el = document.getElementById(id);
		if (!el) {
			el = document.createElement("div");
			el.id = id;
			document.body.appendChild(el);
		}
		return el;
	}

	function buildMetadata() {
		return {
			Sivu: window.location.href,
			Referrer: document.referrer,
			Selain: navigator.userAgent
		};
	}

	function start() {
		if (typeof NinchatEmbed === "undefined") {
			if (window.console) {
				console.error("NinchatEmbed is missing. Load embed3.js before this init script.");
			}
			return;
		}

		ensureContainer(CONTAINER_ID);

		var ninchat = new NinchatEmbed();

		ninchat.on(ninchat.Event.Error, function (data) {
			if (window.console) { console.error("Ninchat error", data); }
		});

		ninchat.init({
			configKey: CONFIG_KEY,
			containerId: CONTAINER_ID,
			config: {
				default: {
					audienceMetadata: buildMetadata()
				}
			}
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start);
	} else {
		start();
	}
}());
