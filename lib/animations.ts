export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  iterations?: number | 'infinite';
}

export interface SpringConfig {
  tension: number;
  friction: number;
  mass?: number;
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// Easing functions
export const easings = {
  // Basic easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier easings
  easeInQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  
  easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  
  easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
  
  easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
  
  // Material Design easings
  materialStandard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  materialDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  materialAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  materialSharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Bounce and elastic
  bounceOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounceIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Custom studio easings
  studioSmooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  studioSnappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  studioProfessional: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
};

// Animation duration presets
export const durations = {
  instant: 0,
  micro: 75,
  fast: 150,
  normal: 200,
  medium: 300,
  slow: 500,
  slower: 750,
  slowest: 1000
};

// Animation utilities
export class AnimationManager {
  private activeAnimations = new Map<string, Animation>();
  private observers = new Map<Element, IntersectionObserver>();

  // Create a keyframe animation
  public createKeyframes(
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions = {}
  ): Animation {
    const animation = element.animate(keyframes, {
      duration: durations.normal,
      easing: easings.studioSmooth,
      fill: 'forwards',
      ...options
    });

    // Store reference for potential cancellation
    const id = this.generateAnimationId();
    this.activeAnimations.set(id, animation);

    // Clean up when animation finishes
    animation.addEventListener('finish', () => {
      this.activeAnimations.delete(id);
    });

    return animation;
  }

  // Animate element entrance
  public animateIn(
    element: Element,
    type: 'fade' | 'slide' | 'scale' | 'blur' | 'bounce' = 'fade',
    direction?: 'up' | 'down' | 'left' | 'right',
    options: Partial<AnimationConfig> = {}
  ): Animation {
    const config: AnimationConfig = {
      duration: durations.medium,
      easing: easings.studioSmooth,
      fill: 'forwards',
      ...options
    };

    let keyframes: Keyframe[] = [];

    switch (type) {
      case 'fade':
        keyframes = [
          { opacity: 0 },
          { opacity: 1 }
        ];
        break;
      
      case 'slide':
        const slideDistance = '30px';
        switch (direction) {
          case 'up':
            keyframes = [
              { opacity: 0, transform: `translateY(${slideDistance})` },
              { opacity: 1, transform: 'translateY(0)' }
            ];
            break;
          case 'down':
            keyframes = [
              { opacity: 0, transform: `translateY(-${slideDistance})` },
              { opacity: 1, transform: 'translateY(0)' }
            ];
            break;
          case 'left':
            keyframes = [
              { opacity: 0, transform: `translateX(${slideDistance})` },
              { opacity: 1, transform: 'translateX(0)' }
            ];
            break;
          case 'right':
            keyframes = [
              { opacity: 0, transform: `translateX(-${slideDistance})` },
              { opacity: 1, transform: 'translateX(0)' }
            ];
            break;
          default:
            keyframes = [
              { opacity: 0, transform: 'translateY(20px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ];
        }
        break;
      
      case 'scale':
        keyframes = [
          { opacity: 0, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
        break;
      
      case 'blur':
        keyframes = [
          { opacity: 0, filter: 'blur(8px)' },
          { opacity: 1, filter: 'blur(0)' }
        ];
        break;
      
      case 'bounce':
        keyframes = [
          { opacity: 0, transform: 'scale(0.3)' },
          { opacity: 0.9, transform: 'scale(1.1)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
        config.easing = easings.bounceOut;
        break;
    }

    return this.createKeyframes(element, keyframes, config);
  }

  // Animate element exit
  public animateOut(
    element: Element,
    type: 'fade' | 'slide' | 'scale' | 'blur' = 'fade',
    direction?: 'up' | 'down' | 'left' | 'right',
    options: Partial<AnimationConfig> = {}
  ): Animation {
    const config: AnimationConfig = {
      duration: durations.fast,
      easing: easings.studioSmooth,
      fill: 'forwards',
      ...options
    };

    let keyframes: Keyframe[] = [];

    switch (type) {
      case 'fade':
        keyframes = [
          { opacity: 1 },
          { opacity: 0 }
        ];
        break;
      
      case 'slide':
        const slideDistance = '30px';
        switch (direction) {
          case 'up':
            keyframes = [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: `translateY(-${slideDistance})` }
            ];
            break;
          case 'down':
            keyframes = [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: `translateY(${slideDistance})` }
            ];
            break;
          case 'left':
            keyframes = [
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: `translateX(-${slideDistance})` }
            ];
            break;
          case 'right':
            keyframes = [
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: `translateX(${slideDistance})` }
            ];
            break;
          default:
            keyframes = [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: 'translateY(-20px)' }
            ];
        }
        break;
      
      case 'scale':
        keyframes = [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.8)' }
        ];
        break;
      
      case 'blur':
        keyframes = [
          { opacity: 1, filter: 'blur(0)' },
          { opacity: 0, filter: 'blur(8px)' }
        ];
        break;
    }

    return this.createKeyframes(element, keyframes, config);
  }

  // Stagger animations for multiple elements
  public staggerIn(
    elements: Element[],
    type: 'fade' | 'slide' | 'scale' | 'blur' = 'fade',
    direction?: 'up' | 'down' | 'left' | 'right',
    staggerDelay = 100,
    options: Partial<AnimationConfig> = {}
  ): Animation[] {
    return elements.map((element, index) => {
      const delayedOptions = {
        ...options,
        delay: (options.delay || 0) + (index * staggerDelay)
      };
      
      return this.animateIn(element, type, direction, delayedOptions);
    });
  }

  // Animate on scroll
  public animateOnScroll(
    element: Element,
    animation: () => Animation,
    threshold = 0.1,
    once = true
  ): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animation();
            
            if (once) {
              observer.unobserve(element);
              this.observers.delete(element);
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    this.observers.set(element, observer);
  }

  // Morph between elements
  public morphElements(
    fromElement: Element,
    toElement: Element,
    duration = durations.medium
  ): Promise<void> {
    return new Promise((resolve) => {
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      const scaleX = toRect.width / fromRect.width;
      const scaleY = toRect.height / fromRect.height;
      const translateX = toRect.left - fromRect.left;
      const translateY = toRect.top - fromRect.top;

      const morphKeyframes: Keyframe[] = [
        { 
          transform: 'translate(0, 0) scale(1, 1)',
          opacity: 1
        },
        { 
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          opacity: 0
        }
      ];

      const animation = this.createKeyframes(fromElement, morphKeyframes, {
        duration,
        easing: easings.studioSmooth,
        fill: 'forwards'
      });

      // Show target element
      const showKeyframes: Keyframe[] = [
        { opacity: 0, transform: `scale(${1/scaleX}, ${1/scaleY})` },
        { opacity: 1, transform: 'scale(1, 1)' }
      ];

      setTimeout(() => {
        this.createKeyframes(toElement, showKeyframes, {
          duration: duration / 2,
          easing: easings.studioSmooth,
          fill: 'forwards'
        });
      }, duration / 2);

      animation.addEventListener('finish', () => resolve());
    });
  }

  // Cancel all active animations
  public cancelAllAnimations(): void {
    this.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.activeAnimations.clear();
  }

  // Cancel specific animation
  public cancelAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      animation.cancel();
      this.activeAnimations.delete(animationId);
    }
  }

  // Clean up all observers
  public cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.cancelAllAnimations();
  }

  private generateAnimationId(): string {
    return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global animation manager instance
export const animationManager = new AnimationManager();

// CSS transition utilities
export function createTransition(configs: TransitionConfig[]): string {
  return configs
    .map(config => 
      `${config.property} ${config.duration}ms ${config.easing} ${config.delay || 0}ms`
    )
    .join(', ');
}

// Spring animation using CSS custom properties
export function createSpringTransition(config: SpringConfig): string {
  const { tension, friction, mass = 1 } = config;
  
  // Convert spring config to CSS timing function
  const damping = friction / (2 * Math.sqrt(mass * tension));
  const frequency = Math.sqrt(tension / mass) / (2 * Math.PI);
  
  const duration = Math.max(300, 1000 / frequency);
  
  if (damping < 1) {
    // Underdamped spring
    const dampedFreq = frequency * Math.sqrt(1 - damping * damping);
    return `cubic-bezier(0.17, 0.67, ${1 - damping}, 1)`;
  } else {
    // Critically or overdamped
    return easings.easeOutQuart;
  }
}

// React hook for animations
export function useAnimations() {
  const manager = useRef(new AnimationManager()).current;

  useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  return {
    animateIn: manager.animateIn.bind(manager),
    animateOut: manager.animateOut.bind(manager),
    staggerIn: manager.staggerIn.bind(manager),
    animateOnScroll: manager.animateOnScroll.bind(manager),
    morphElements: manager.morphElements.bind(manager),
    cancelAllAnimations: manager.cancelAllAnimations.bind(manager)
  };
}

// Performance optimized animations
export const performanceAnimations = {
  // GPU-accelerated properties only
  gpuOptimized: ['transform', 'opacity', 'filter'],
  
  // Check if animation will be GPU accelerated
  isGPUAccelerated: (property: string): boolean => {
    return performanceAnimations.gpuOptimized.includes(property);
  },
  
  // Force GPU acceleration
  forceGPUAcceleration: (element: Element): void => {
    (element as HTMLElement).style.transform = 'translateZ(0)';
    (element as HTMLElement).style.willChange = 'transform, opacity';
  },
  
  // Remove GPU acceleration
  removeGPUAcceleration: (element: Element): void => {
    (element as HTMLElement).style.transform = '';
    (element as HTMLElement).style.willChange = 'auto';
  }
};

// Animation presets for common UI elements
export const animationPresets = {
  // Modal animations
  modal: {
    enter: {
      keyframes: [
        { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' }
      ],
      options: { duration: durations.medium, easing: easings.studioSmooth }
    },
    exit: {
      keyframes: [
        { opacity: 1, transform: 'scale(1) translateY(0)' },
        { opacity: 0, transform: 'scale(0.9) translateY(-10px)' }
      ],
      options: { duration: durations.fast, easing: easings.studioSmooth }
    }
  },
  
  // Tooltip animations
  tooltip: {
    enter: {
      keyframes: [
        { opacity: 0, transform: 'scale(0.8) translateY(5px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' }
      ],
      options: { duration: durations.fast, easing: easings.bounceOut }
    },
    exit: {
      keyframes: [
        { opacity: 1, transform: 'scale(1) translateY(0)' },
        { opacity: 0, transform: 'scale(0.8) translateY(5px)' }
      ],
      options: { duration: durations.micro, easing: easings.studioSmooth }
    }
  },
  
  // Button press animation
  buttonPress: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(0.95)' },
      { transform: 'scale(1)' }
    ],
    options: { duration: durations.micro, easing: easings.bounceOut }
  },
  
  // Loading spinner
  spinner: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ],
    options: { duration: 1000, easing: easings.linear, iterations: Infinity }
  },
  
  // Pulse animation
  pulse: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    options: { duration: durations.slower, easing: easings.easeInOutQuad, iterations: Infinity }
  }
};