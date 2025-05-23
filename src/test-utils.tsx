// src/test-utils.tsx
import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from '@testing-library/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Override the render method to wrap in act() by default
const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { render };