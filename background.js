let lastPlayTime = 0;
let lastHostname = "";
const COOLDOWN_MS = 10000; // 10 secs cooldown

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.type !== "main_frame") {
      return;
    }

    try {
      const url = new URL(details.url);
      const currentHostname = url.hostname;
      const now = Date.now();

      // Checking if the same domain
      if (currentHostname === lastHostname) {
        return;
      }

      // Checking cooldown
      if (now - lastPlayTime < COOLDOWN_MS) {
        lastHostname = currentHostname;
        return;
      }

      // Saving new time and domain
      lastPlayTime = now;
      lastHostname = currentHostname;

      // Stopping the website loading and playing the sound
      return new Promise((resolve) => {
        const audio = new Audio(browser.runtime.getURL("modem.mp3"));

        // Loading the site after the sound stopped playing
        audio.onended = () => {
          resolve({});
        };

        audio.onerror = () => {
          resolve({});
        };

        // Start playing
        audio.play().catch((err) => {
          console.log("Błąd odtwarzania/blokada autoodtwarzania:", err);
          resolve({});
        });
      });

    } catch (e) {
      console.error(e);
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);