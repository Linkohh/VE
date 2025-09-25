import { render, screen } from '@testing-library/svelte';
import Footer from '../src/lib/Footer.svelte';
import { describe, it, expect } from 'vitest';

describe('Footer component', () => {
  it('renders the footer text', () => {
    render(Footer);
    const footerElement = screen.getByText(/VibeMe by Jules/i);
    expect(footerElement).toBeInTheDocument();
  });
});