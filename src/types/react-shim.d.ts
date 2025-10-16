// Enhanced temporary shims for React and JSX so tsc doesn't error before node_modules/@types are installed.
// These provide basic generic shapes used throughout the codebase. Remove once real types are installed.

declare namespace React {
  type Key = string | number;
  type ReactNode = any;
  type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactNode;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prev: S) => S);

  function useState<S = any>(initialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useRef<T = any>(initial?: T | null): { current: T | null };
  function useMemo<T>(factory: () => T, deps?: any[]): T;
  interface Context<T> { Provider: any; Consumer: any }
  function createContext<T>(defaultValue: T): Context<T>;
  function useContext<T>(context: Context<T>): T;
  interface FormEvent { preventDefault(): void; target: any }
  interface ChangeEvent<T = any> { target: T }
  const StrictMode: any;
}

declare module 'react' {
  export = React;
}

declare module 'react-dom' {
  const ReactDOM: {
    createRoot: (el: Element) => { render: (node: any) => void };
  };
  export default ReactDOM;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
