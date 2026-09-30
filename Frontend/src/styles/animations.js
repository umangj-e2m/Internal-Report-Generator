const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const fadeInUp = (delayMs = 0) => ({
  animation: `fade-in-up 0.6s ${EASE_OUT} both`,
  animationDelay: `${delayMs}ms`,
});

export const fadeIn = (delayMs = 0) => ({
  animation: `fade-in 0.5s ease both`,
  animationDelay: `${delayMs}ms`,
});

export const hoverLift = {
  transition: `transform 0.3s ${EASE_OUT}, box-shadow 0.3s ${EASE_OUT}, border-color 0.3s ease`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 14px 32px rgba(27, 35, 64, 0.10)',
    borderColor: 'rgba(242, 107, 33, 0.45)',
  },
};

export const STAGGER_MS = 70;
