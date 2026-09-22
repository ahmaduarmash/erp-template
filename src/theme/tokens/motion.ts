import type { TemplateConfig } from '../../config/template.config.ts';

export interface MotionTokens {
  micro: number;
  standard: number;
  page: number;
  modalEnter: number;
  modalExit: number;
  drawerEnter: number;
  drawerExit: number;
  easingEnter: [number, number, number, number];
  easingExit: [number, number, number, number];
  easingEnterCss: string;
  easingExitCss: string;
  spring: { stiffness: number; damping: number };
}

const SPEEDS: Record<TemplateConfig['motion']['speed'], Omit<MotionTokens, 'easingEnter' | 'easingExit' | 'easingEnterCss' | 'easingExitCss' | 'spring'>> = {
  fast: {
    micro: 0.09,
    standard: 0.14,
    page: 0.1,
    modalEnter: 0.15,
    modalExit: 0.1,
    drawerEnter: 0.15,
    drawerExit: 0.1,
  },
  normal: {
    micro: 0.13,
    standard: 0.19,
    page: 0.15,
    modalEnter: 0.2,
    modalExit: 0.14,
    drawerEnter: 0.2,
    drawerExit: 0.14,
  },
};

export function deriveMotion(speed: TemplateConfig['motion']['speed']): MotionTokens {
  return {
    ...SPEEDS[speed],
    easingEnter: [0.16, 1, 0.3, 1],
    easingExit: [0.4, 0, 1, 1],
    easingEnterCss: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easingExitCss: 'ease-in',
    spring: { stiffness: 500, damping: 35 },
  };
}
