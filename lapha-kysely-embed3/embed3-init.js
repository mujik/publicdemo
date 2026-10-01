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

	function vahvistaChatinSulkeminen(ninchat, containerId) {
		var reitti = "";
		var paattynyt = false;
		var paastaLapi = false;
		ninchat.on(ninchat.Event.Route, function (data) {
			reitti = (data && data.route && data.route.name) || "";
			if (reitti !== "EmbedChannel") { paattynyt = false; }
		});
		[ninchat.Event.AudienceEnded, ninchat.Event.AudienceClosed].forEach(function (ev) {
			if (ev) { ninchat.on(ev, function () { paattynyt = true; }); }
		});
		document.addEventListener("click", function (e) {
			if (paastaLapi || !e.target || !e.target.closest) { return; }
			var nappi = e.target.closest(".ninchat-embed-close-button");
			var root = document.getElementById(containerId);
			if (!nappi || !root || !root.contains(nappi)) { return; }
			var ikkuna = root.querySelector(".ninchat-embed");
			if (reitti !== "EmbedChannel" || paattynyt || (ikkuna && ikkuna.classList.contains("ninchat-embed-minimized"))) { return; }
			e.preventDefault();
			e.stopImmediatePropagation();
			naytaSulkemisvahvistus(ikkuna || root, ninchat.config || {}, function () {
				paastaLapi = true;
				try { nappi.click(); } finally { paastaLapi = false; }
			}, nappi);
		}, true);
	}

	function naytaSulkemisvahvistus(ikkuna, config, kylla, palautaFokus) {
		if (ikkuna.querySelector(".lapha-sulkuvahvistus")) { return; }
		var vari = "rgb(60, 43, 124)";
		var tausta = document.createElement("div");
		tausta.className = "lapha-sulkuvahvistus";
		tausta.style.cssText = "position:absolute;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;" +
			"padding:20px;background:rgba(0,0,0,.45);font-family:inherit;border-radius:inherit;";
		var kortti = document.createElement("div");
		kortti.setAttribute("role", "alertdialog");
		kortti.setAttribute("aria-modal", "true");
		kortti.setAttribute("aria-labelledby", "lapha-sulkuvahvistus-otsikko");
		kortti.setAttribute("aria-describedby", "lapha-sulkuvahvistus-teksti");
		kortti.style.cssText = "background:#fff;color:#1d1d1d;border-radius:12px;padding:24px 20px 20px;max-width:320px;width:100%;" +
			"box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center;";
		var ikoni = document.createElement("div");
		ikoni.setAttribute("aria-hidden", "true");
		ikoni.style.cssText = "width:40px;height:40px;margin:0 auto 12px;border:2px solid " + vari + ";border-radius:50%;" +
			"color:" + vari + ";font:700 22px/36px Georgia, serif;";
		ikoni.textContent = "i";
		var otsikko = document.createElement("div");
		otsikko.id = "lapha-sulkuvahvistus-otsikko";
		otsikko.style.cssText = "font-size:18px;font-weight:700;margin:0 0 8px;color:" + vari + ";";
		otsikko.textContent = config.closeConfirmTitle || "Suljetaanko chat?";
		var teksti = document.createElement("div");
		teksti.id = "lapha-sulkuvahvistus-teksti";
		teksti.style.cssText = "font-size:15px;line-height:1.45;margin:0 0 20px;";
		teksti.textContent = config.closeConfirmText || "Haluatko varmasti lopettaa käynnissä olevan keskustelun?";
		function nappi(text, ensisijainen) {
			var b = document.createElement("button");
			b.type = "button";
			b.textContent = text;
			b.style.cssText = "display:block;width:100%;margin:8px 0 0;padding:12px 16px;border-radius:24px;font:inherit;font-size:15px;" +
				"font-weight:700;cursor:pointer;border:2px solid " + vari + ";" +
				(ensisijainen ? "background:" + vari + ";color:#fff;" : "background:#fff;color:" + vari + ";");
			return b;
		}
		var kyllaNappi = nappi("Kyllä, sulje chat", true);
		var peruNappi = nappi("Palaa chattiin", false);
		function sulje() {
			document.removeEventListener("keydown", nappaimet, true);
			tausta.remove();
		}
		function nappaimet(e) {
			if (e.key === "Escape") { e.stopPropagation(); sulje(); if (palautaFokus) { palautaFokus.focus(); } }
			if (e.key === "Tab") {
				e.preventDefault();
				(document.activeElement === kyllaNappi ? peruNappi : kyllaNappi).focus();
			}
		}
		kyllaNappi.addEventListener("click", function () { sulje(); kylla(); });
		peruNappi.addEventListener("click", function () { sulje(); if (palautaFokus) { palautaFokus.focus(); } });
		kortti.appendChild(ikoni);
		kortti.appendChild(otsikko);
		kortti.appendChild(teksti);
		kortti.appendChild(kyllaNappi);
		kortti.appendChild(peruNappi);
		tausta.appendChild(kortti);
		if (getComputedStyle(ikkuna).position === "static") { ikkuna.style.position = "relative"; }
		ikkuna.appendChild(tausta);
		document.addEventListener("keydown", nappaimet, true);
		kyllaNappi.focus();
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

		vahvistaChatinSulkeminen(ninchat, CONTAINER_ID);

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
