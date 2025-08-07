/ File ini memberitahu TypeScript cara mengenali tag <model-viewer> di dalam JSX.
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        ar?: boolean;
        'shadow-intensity'?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}