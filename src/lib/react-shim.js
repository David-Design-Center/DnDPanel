// This file provides exported symbols that some libraries expect from React 
// Fixes issues with radix-ui icons and other libraries
import * as React from 'react';

// Re-export all React exports that libraries might look for
export const {
  Fragment,
  StrictMode,
  Suspense,
  Children,
  Component,
  PureComponent,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React;

export default React;
