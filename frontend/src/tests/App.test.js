/**
 * @fileoverview This file contains tests for the App component using React Testing Library.
 *
 * The test checks that the App component renders the "learn react" text in the document.
 * It serves as a basic smoke test to ensure that the App component is mounting and displaying
 * expected content.
 *
 * @module AppTest
 */

import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
