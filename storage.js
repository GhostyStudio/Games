(async () => {
	if(window.self == window.top || window.top.location.hostname === window.location.hostname) return;
	const ua = navigator.userAgent;
	if (
		/Safari/.test(ua) &&
		/iPad|iPhone|Macintosh/.test(ua) &&
		document.hasStorageAccess &&
		!(await document.hasStorageAccess())
	) {
		const o = encodeURIComponent(location.pathname + location.search);
		location.href = '/storage.html?source=' + o;
	}
})();
