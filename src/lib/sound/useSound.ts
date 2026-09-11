import { useCallback } from 'react';
import { useTemplate } from '../../theme/ThemeProvider';
import type { Tone } from './synth';
export function useSound() {
  const { config } = useTemplate();
  return useCallback(
    (kind: Tone) => {
      if (
        config.sound.enabled &&
        config.sound.categories[kind] &&
        navigator.userActivation?.hasBeenActive
      )
        void import('./synth')
          .then(({ playTone }) => playTone(kind, config.sound.volume))
          .catch(() => {});
    },
    [config.sound],
  );
}
