let audioCtx: AudioContext | null = null;

async function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext;
    if (!Ctx) throw new Error("WebAudio non supporté");
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch (e) {
      console.warn("Impossible de résumer AudioContext:", e);
    }
  }
  return audioCtx;
}

async function playBeep(duration = 250, frequency = 1000, volume = 0.5) {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);

    const startGain = 0.0001;
    gain.gain.setValueAtTime(startGain, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(volume, 0.0001),
      now + 0.01
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    const stopTime = now + duration / 1000;

    gain.gain.exponentialRampToValueAtTime(startGain, stopTime - 0.01);
    osc.stop(stopTime);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (_) {
        // ignore
      }
    };
  } catch (e) {
    console.warn("failed to play beep", e);
  }
}

export { getAudioContext, playBeep };
