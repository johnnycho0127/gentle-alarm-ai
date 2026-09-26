# WakeUp AI English voice update

## Build
- Restore the English voice selector with Warm Friend, Energetic Coach, and Calm Presenter.
- Save the selected time and voice locally with the alarm.
- Add a secure server endpoint that sends the selected-time greeting to ElevenLabs and returns MP3 audio.
- Update the incoming-call heading and active-call controls to the requested English wording.
- Show a subtle voice-generation state after Answer, then play the generated audio automatically.
- Keep Hang Up available while loading and show a retry action if voice generation fails.

## Technical details
- Keep `ELEVENLABS_API_KEY` server-side and call ElevenLabs directly from a public API route.
- Validate request input, map each selector option to an approved ElevenLabs voice, and request `mp3_44100_128` with `eleven_multilingual_v2`.
- Revoke generated browser audio URLs and cancel stale requests when the call ends.
- Verify the main, incoming, loading, active-call, and hang-up flows on a phone-sized viewport.
