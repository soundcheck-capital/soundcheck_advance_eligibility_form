// Lightweight loader that pulls in the custom form component and mounts it.
(function () {
    const scriptSource = (document.currentScript && document.currentScript.src) || document.baseURI;
    const widgetScript = document.currentScript;
    const scriptUrl = new URL(scriptSource, document.baseURI);
    const widgetTheme =
        (widgetScript && (widgetScript.dataset.theme || widgetScript.dataset.variant)) ||
        scriptUrl.searchParams.get("theme") ||
        scriptUrl.searchParams.get("variant");

    function ensureComponentLoaded() {
        if (window.customElements && customElements.get("custom-form")) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const loader = document.createElement("script");
            loader.src = new URL("./scriptform.js", scriptSource).href;
            loader.async = true;
            loader.onload = () => resolve();
            loader.onerror = () => reject(new Error("Impossible de charger le widget Soundcheck."));
            document.head.appendChild(loader);
        });
    }

    function mountWidget() {
        const target =
            document.querySelector("[data-soundcheck-widget]") ||
            document.querySelector("#soundcheck-widget") ||
            (() => {
                const wrapper = document.createElement("div");
                wrapper.id = "soundcheck-widget";
                document.body.appendChild(wrapper);
                return wrapper;
            })();

        const alreadyMounted = target.querySelector("custom-form");
        const element = alreadyMounted || document.createElement("custom-form");

        if (widgetTheme) {
            element.setAttribute("data-theme", widgetTheme);
        }

        if (!alreadyMounted) {
            target.appendChild(element);
        }
    }

    function start() {
        ensureComponentLoaded()
            .then(() => {
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
                } else {
                    mountWidget();
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    start();
})();
