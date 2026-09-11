export type Tone = 'click' | 'success' | 'warning' | 'notification';
let context: AudioContext | undefined;
let lastTone = 0;
export async function playTone(kind: Tone, volume: number) {
  try {
    if (Date.now() - lastTone < 75) return;
    lastTone = Date.now();
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    const notes = {
      click: [640],
      success: [520, 780],
      warning: [320, 260],
      notification: [740, 990, 880],
    }[kind];
    notes.forEach((frequency, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const start = context!.currentTime + index * 0.07;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(Math.min(0.15, volume * 0.15), start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
      oscillator.connect(gain);
      gain.connect(context!.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.1);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  } catch {
    /* Audio availability must never affect an action. */
  }
}
