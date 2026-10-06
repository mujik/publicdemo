(function () {
	"use strict";

	var BASE_CONFIG_KEY = "site/3l8ra95n00qtg/crcb00178q00a.json";
	var IMPL_CONFIG_URL = "https://api.ninchat.com/config/site/a1ke0h0n0035c/crcu00m1dc002.json";
	var CONTAINER_ID = "ninchat-suunta";
	var currentScript = document.currentScript;
	var started = false;

	function ensureContainer(id) {
		var el = document.getElementById(id);
		if (!el) {
			el = document.createElement("div");
			el.id = id;
			document.body.appendChild(el);
		}
		return el;
	}

	function buildEnvironment() {
		var environment = ["floating"];
		if (window.location.href.indexOf("/login") > -1) {
			environment.push("theme-floating-light");
		}
		return environment;
	}

	function buildMetadata() {
		return {
			Sivu: window.location.href,
			Referrer: document.referrer,
			Selain: navigator.userAgent
		};
	}

	function start() {
		if (started) { return true; }
		if (typeof NinchatEmbed === "undefined") {
			if (window.console) { console.error("NinchatEmbed puuttuu. Lataa embed3.js ennen tätä init-skriptiä."); }
			return false;
		}
		if (!IMPL_CONFIG_URL) {
			if (window.console) { console.error("Suunta-botin toteutusconfigia ei ole vielä julkaistu (IMPL_CONFIG_URL puuttuu)."); }
			return false;
		}
		started = true;

		ensureContainer(CONTAINER_ID);

		var ninchat = new NinchatEmbed();
		ninchat.on(ninchat.Event.Error, function (data) {
			if (window.console) { console.error("Ninchat error", data); }
		});

		ninchat.init({
			configKey: BASE_CONFIG_KEY,
			configUrls: [IMPL_CONFIG_URL],
			environment: buildEnvironment(),
			containerId: CONTAINER_ID,
			config: {
				default: {
					audienceMetadata: buildMetadata()
				}
			}
		});
		return true;
	}

	function palloValmis() {
		var kaare = document.querySelector(".ninchat-embed-ball");
		var pallo = document.querySelector(".ninchat-embed-ball-button");
		if (!kaare || !pallo) { return null; }
		var luokat = " " + kaare.className + " ";
		if (luokat.indexOf(" transitions-enabled ") < 0) { return null; }
		return pallo;
	}

	function avaa() {
		if (!start()) { return; }
		var yritykset = 0;
		var ajastin = setInterval(function () {
			var pallo = palloValmis();
			yritykset++;
			if (pallo) {
				clearInterval(ajastin);
				if (pallo.getAttribute("aria-expanded") !== "true") {
					setTimeout(function () { pallo.click(); }, 300);
				}
			} else if (yritykset > 150) {
				clearInterval(ajastin);
			}
		}, 100);
	}

	window.SuuntisBotti = { avaa: avaa };

	if (currentScript && currentScript.getAttribute("data-start") === "manual") {
		return;
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start);
	} else {
		start();
	}
}());
