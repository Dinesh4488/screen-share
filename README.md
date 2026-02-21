**Screen Share — React + Vite**

This project is a simple screen-sharing demo built with React and Vite.

**Contents added:** setup instructions, explanation of the screen-sharing flow, placeholder screenshots, and known limitations/browser quirks.

**Setup**

- Requirements: Node.js >= 16 and npm or yarn.
- Install dependencies:

```bash
npm install
# or
yarn
```

- Start the dev server:

```bash
npm run dev
# or
yarn dev
```

- Open the app at the URL shown by Vite (typically `http://localhost:5173`).

**Screen-sharing flow**

- 1) User opens the Screen Share page (`ScreenShareTest`).
- 2) The page requests a screen media stream using `navigator.mediaDevices.getDisplayMedia()`.
- 3) The obtained MediaStream is attached to a local `<video>` element for preview.
- 4) If the app is extended to peer-to-peer, the MediaStream tracks would be sent over WebRTC (create RTCPeerConnection, add tracks, exchange SDP via signaling).
- 5) When the user stops sharing (via browser UI or `MediaStreamTrack.stop()`), the app detects the `ended` event and clears the preview.

Notes: This app currently demonstrates local capture and preview. There is no built-in signaling or peer connection in this demo unless you add it.

**Screenshots (placeholders)**

- Local preview: ![Local preview placeholder](screenshots/local-preview.png)
- Share prompt (browser dialog): ![Share prompt placeholder](screenshots/share-prompt.png)
- Remote view (if connected to a peer): ![Remote view placeholder](screenshots/remote-view.png)

Place your real screenshots under `public/screenshots/` or `screenshots/` and update the paths above.

**Known limitations & browser quirks**

- getDisplayMedia requires a secure context (HTTPS) or `localhost`.
- Some browsers prompt for the entire screen, a window, or a tab; behavior varies by browser and OS.
- Audio capture: `getDisplayMedia({audio: true})` is not consistently supported across browsers; capturing system audio is often disabled or limited (Chrome allows tab audio capture only when choosing a tab).
- Permissions: users can revoke sharing at any time via browser UI — handle `ended` events on tracks.
- Mobile: screen capture via `getDisplayMedia` has limited support on mobile browsers.
- Cross-origin iframes or protected content (DRM) may block capture of certain frames or media.

If you'd like, I can add an example WebRTC peer connection flow and basic signaling (socket + express) to demonstrate remote viewers.
