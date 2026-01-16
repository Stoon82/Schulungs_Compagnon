// Animation utility library for The Compagnon

export const createParticles = (container, count = 50) => {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: linear-gradient(135deg, 
        hsl(${Math.random() * 360}, 70%, 60%), 
        hsl(${Math.random() * 360}, 70%, 80%)
      );
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.3};
      animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    
    container.appendChild(particle);
    particles.push(particle);
  }
  
  return particles;
};

export const createConfetti = (x = window.innerWidth / 2, y = 0) => {
  const colors = ['#00fff2', '#ff00ff', '#ffff00', '#00ff00', '#ff0080'];
  const confettiCount = 50;
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 10 + 5;
    
    confetti.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      transform: rotate(${Math.random() * 360}deg);
      animation: confettiFall ${Math.random() * 2 + 2}s ease-out forwards;
    `;
    
    confetti.style.setProperty('--tx', `${Math.cos(angle) * velocity * 50}px`);
    confetti.style.setProperty('--ty', `${Math.sin(angle) * velocity * 50 + 500}px`);
    confetti.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
    
    container.appendChild(confetti);
  }

  setTimeout(() => {
    document.body.removeChild(container);
  }, 4000);
};

export const pulseAnimation = (element, duration = 300) => {
  element.style.animation = `pulse ${duration}ms ease-in-out`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export const shakeAnimation = (element, duration = 500) => {
  element.style.animation = `shake ${duration}ms ease-in-out`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export const unlockAnimation = (element, callback) => {
  element.style.animation = 'unlock 800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  
  setTimeout(() => {
    element.style.animation = '';
    if (callback) callback();
  }, 800);
};

export const fadeIn = (element, duration = 300) => {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in`;
  
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
};

export const slideIn = (element, direction = 'up', duration = 300) => {
  const transforms = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)'
  };
  
  element.style.opacity = '0';
  element.style.transform = transforms[direction];
  element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translate(0, 0)';
  }, 10);
};

export const rippleEffect = (event, element) => {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    left: ${x}px;
    top: ${y}px;
    transform: scale(0);
    animation: ripple 600ms ease-out;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};
