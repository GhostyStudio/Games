'use strict';

(function () {
	var gameStarted = false;

	/*
     Two main purposes:
      - Keep alive to track active players
      - Redirect if embedded and not via permitted URL
     */
	window.PlayGame = {
		init: function () {
			PlayGame.initMessageListener();
			PlayGame.checkInFrame();
			PlayGame.preventPageScrolling();

			// Fire initial keep alive ASAP, then timed.
			PlayGame.keepAlive();
			setInterval(function () {
				PlayGame.keepAlive();
			}, 20000);
		},

		initMessageListener: function () {
			window.addEventListener('message', function (e) {
				const message = e.data;
				if (message === 'AuthStep2') {
					// Check hosted on intended domain
					if (constructNet_gameEmbedURL.startsWith(e.origin)) {
						PlayGame.startGame();
					}
				}
			});
		},

		checkInFrame: function () {},
		isInFrame: function () {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		},

		setCookie: function (name, value, days) {
			var expires = '';
			if (days) {
				const date = new Date();
				date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
				expires = '; expires=' + date.toUTCString();
			}
			document.cookie = name + '=' + (value || '') + expires + '; path=/; domain=.constructdev.net; secure';
		},

		getCookie: function (name) {
			const nameEQ = name + '=';
			const ca = document.cookie.split(';');
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) === ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		},

		keepAlive: function () {},

		// Last step to load the game, includes required scripts
		startGame: function () {
			if (gameStarted === true) return;

			// Add javascript tags
			let promiseArray = [];
			for (let i = 0; i < constructNet_scriptURLs.length; i++) {
				promiseArray.push(PlayGame.addScript(constructNet_scriptURLs[i]));
			}

			Promise.all(promiseArray).then(function (values) {
				if (constructNet_madeInC2) {
					jQuery(document).ready(function () {
						cr_createRuntime('c2canvas');
					});
					document.addEventListener('visibilitychange', PlayGame.c2onVisibilityChanged, false);
					document.addEventListener('mozvisibilitychange', PlayGame.c2onVisibilityChanged, false);
					document.addEventListener('webkitvisibilitychange', PlayGame.c2onVisibilityChanged, false);
					document.addEventListener('msvisibilitychange', PlayGame.c2onVisibilityChanged, false);
				}

				gameStarted = true;
			});
		},
		c2onVisibilityChanged: function () {
			if (document.hidden || document.mozHidden || document.webkitHidden || document.msHidden)
				cr_setSuspended(true);
			else cr_setSuspended(false);
		},

		addScript: function (src) {
			return new Promise(function (resolve, reject) {
				const s = document.createElement('script');
				s.setAttribute('src', src);
				s.onload = resolve;
				s.onerror = reject;
				s.async = false;
				document.body.appendChild(s);
			});
		},

		// Prevent parent frame scrolling when certain keys pressed
		preventPageScrolling: function () {
			document.addEventListener('keydown', function (event) {
				if (
					event.target &&
					event.target.tagName &&
					['input', 'textarea', 'datalist', 'select'].includes(event.target.tagName.toLowerCase())
				) {
					// Keyboard presses for input elements: allow
					return;
				}

				// Otherwise block arrow keys only to prevent scrolling
				if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
					event.preventDefault();
				}
			});

			// Right click
			document.oncontextmenu = function (event) {
				if (event.preventDefault !== undefined) event.preventDefault();
				if (event.stopPropagation !== undefined) event.stopPropagation();
			};

			// Mouse wheel
			document.addEventListener(
				'mousewheel',
				function (event) {
					event.preventDefault();
				},
				{ passive: false }
			);
		},
	};
	PlayGame.init();
	PlayGame.startGame();
})();
