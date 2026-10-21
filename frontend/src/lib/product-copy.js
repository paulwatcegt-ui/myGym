// Only reviewed product-copy keys are rebranded. Translation keys, user text,
// URLs, storage names and legal notices retain their original identity.
const PRODUCT_COPY = new Set([
  "This browser doesn't do passkeys, but you can still use openGym locally on this device.",
  "Scan this with the other device, or open openGym there and enter the code on the sign-in screen. It works once, for {0} minutes.",
  "Saves a dated copy to Documents/openGym after finishing a workout or editing a routine, and keeps the newest {0}. Point a sync app at that folder, or copy it out by hand.",
  "to install openGym as a full-screen app.",
  "Rest-timer alerts, even if openGym is closed.",
  "A small file a friend can import into their own openGym. Routines only, none of your workouts or weigh-ins.",
  "this isn’t an openGym plan file",
  "Made with openGym",
  "Reload openGym",
  "Sync this device to your own self-hosted openGym instead.",
  "Connect the openGym app on your phone to this account.",
  "On the openGym app, choose “Connect to my server”, then enter this address and the code below. It expires in 5 minutes.",
  "How do you want to use openGym?",
  "Local keeps everything on this phone. Connecting syncs to your own openGym server instead. You can switch later in Settings.",
  "Android blocks unencrypted http:// connections from apps, so this phone can only reach an https:// endpoint. Put HTTPS in front of it (Tailscale or a reverse proxy), or choose “Use my self-hosted openGym”: your server can reach an http:// model on its own network.",
  "Runs on your openGym server",
  "Use my self-hosted openGym",
  "Update to openGym v{0}",
  "The server answered with something other than openGym data.",
  "Not an openGym answer (HTTP {0})",
  "Your server’s address answered with something other than openGym (HTTP {0}). Your changes are kept here.",
  "Self-host openGym",
  "This demo runs entirely in your browser on example data. Nothing is sent anywhere. Passkey sign-in and sync across your devices come with the openGym server, which you get by self-hosting it.",
  "Your coach gives up control of this week: openGym owns the queue from here on and repeats these sessions by itself once they are all done. A new week from the coach’s app would replace this rotation.",
  "Your server was reached, but it refused the app’s request (CORS). If a reverse proxy such as Traefik adds CORS headers, let requests from {0} through to openGym unchanged. See “Phone app and CORS” in docs/SELF_HOSTING.md.",
  "openGym can no longer write to “{0}”, so copies go to Documents/openGym again. Choose the folder again to switch back.",
  "openGym can no longer write to the chosen folder, so copies go to Documents/openGym again. Choose the folder again to switch back.",
  "That address answers, but it isn’t an openGym server. Check the URL.",
  "That address answers, but a login page or proxy rule replied instead of openGym. Let /api/ through to openGym unchanged. See “Phone app and CORS” in docs/SELF_HOSTING.md.",
  "iPhone doesn’t let openGym vibrate. A sound or a flash does the job.",
  "Open Settings → Account → “Pair the mobile app” on the openGym site you’re already signed into, then enter its address and the code shown there.",
  "Open Settings → Account → “Pair the mobile app” on your openGym site in a browser and enter the new code shown there. What this phone kept is merged into your account.",
  "That file isn’t an openGym backup.",
  "Workouts and weigh-ins go to Health Connect when you finish or change them. openGym reads nothing back.",
  "What openGym already wrote can stay in Health Connect as your data, or be removed from it."
])
export function productCopy(key, text) {
  if (!PRODUCT_COPY.has(key)) return text
  // Documents/openGym is an existing data path, not a product label.
  return text.replace(/\ban openGym\b/g, 'a openGym')
    .replace(/(?<![\w/.])openGym(?![\w/]|\.[\w])/g, 'myGym')
}
