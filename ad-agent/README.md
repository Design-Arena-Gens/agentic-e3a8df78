## AdAgent – AI Assisted Ad Production

AdAgent is a full-stack Next.js application that orchestrates four stages of a 3-scene commercial:

1. **Brain (Script)** – Generates Hinglish dialog + cinematic prompts by calling OpenAI (falls back to an offline template if API keys are absent).
2. **Voice** – Requests ElevenLabs TTS for each scene and returns data-URL audio assets (skips gracefully without keys).
3. **Eyes** – Sends photorealistic prompts to Runway/Stability image-to-video API and surfaces returned URLs or job metadata.
4. **Hands (Assembly)** – Aggregates every asset into a storyboard UI with playback, status badges, and warnings.

### Project Setup

1. Copy `.env.example` to `.env.local` and supply real API credentials:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm run dev
```

4. Visit `http://localhost:3000`, enter a product name, and launch the AI pipeline.

### Environment Variables

| Key | Description |
| --- | ----------- |
| `OPENAI_API_KEY` | Required for live script generation. |
| `OPENAI_MODEL` | Optional override (defaults to `gpt-4o-mini`). |
| `ELEVENLABS_API_KEY` | Enables Hinglish voice synthesis per scene. |
| `ELEVENLABS_VOICE_ID` | Voice preset (defaults to Rachel). |
| `ELEVENLABS_MODEL` | Optional TTS model override. |
| `RUNWAY_API_KEY` | Runway or Stability API token for video generation. |

Without keys, the pipeline still returns a high-quality scripted storyboard while marking the voice/video stages as skipped.

### Production Build

```bash
npm run build
npm run start
```

Deploy directly using the provided Vercel command (see deployment instructions in the automation brief).
