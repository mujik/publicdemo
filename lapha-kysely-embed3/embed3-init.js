(function () {
	"use strict";

	var BASE_CONFIG_KEY = "site/3l8ra95n00qtg/crcb000v6v00a.json";

	var IMPL_CONFIG_URL = "https://api.ninchat.com/config/site/bo14kc7900578/crcb000t9a008.json";

	var ENVIRONMENT = ["floating", "lapha", "lapha-anonymous", "pyyda-apua"];

	var AGENTTI_PIILOTETTU = false;
	var AGENTTI_PIILOTETTU_OTSIKKO = { nimi: "Päivystäjä", kuva: "https://ninchat.com/customer/poske/lapha-logo.png", alt: "Lapha" };
	if (AGENTTI_PIILOTETTU) { ENVIRONMENT = ENVIRONMENT.concat(["agentti-piilotettu"]); }
	var CONTAINER_ID = "ninchat-lapha-kysely";

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

	function peitaAgentinTiedotOtsikkopalkissa(containerId, asetukset) {
		if (!window.MutationObserver) { return null; }

		var kaynnissa = false;
		function korjaa() {
			if (kaynnissa) { return; }
			kaynnissa = true;
			try {
				var root = document.getElementById(containerId);
				var header = root && root.querySelector(".ninchat-embed-header");
				if (!header) { return; }
				var kuva = header.querySelector(".ninchat-embed-header-image-wrapper");
				var otsikko = header.querySelector(".ninchat-embed-header-title");
				var alaotsikko = header.querySelector(".ninchat-embed-header-subtitle");
				var agenttiNakyy = kuva && kuva.querySelector(".ninchat-embed-member-image, .ninchat-embed-member-icon");
				if (!agenttiNakyy) { return; }
				var img = document.createElement("img");
				img.className = "ninchat-embed-header-image";
				img.alt = asetukset.alt || "";
				img.src = asetukset.kuva;
				kuva.textContent = "";
				kuva.appendChild(img);
				if (otsikko) { otsikko.textContent = asetukset.nimi; }
				if (alaotsikko) { alaotsikko.textContent = ""; }
			} finally { kaynnissa = false; }
		}
		var observer = new MutationObserver(korjaa);
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });
		korjaa();
		return observer;
	}

	function start() {
		if (typeof NinchatEmbed === "undefined") {
			if (window.console) {
				console.error("NinchatEmbed puuttuu. Lataa embed3.js ennen tätä init-skriptiä.");
			}
			return;
		}

		ensureContainer(CONTAINER_ID);

		var ninchat = new NinchatEmbed();

		ninchat.on(ninchat.Event.Error, function (data) {
			if (window.console) { console.error("Ninchat error", data); }
		});

		if (AGENTTI_PIILOTETTU) {
			peitaAgentinTiedotOtsikkopalkissa(CONTAINER_ID, AGENTTI_PIILOTETTU_OTSIKKO);
		}

		ninchat.init({
			configKey: BASE_CONFIG_KEY,
			configUrls: [IMPL_CONFIG_URL],
			environment: ENVIRONMENT,
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
