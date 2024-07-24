import { render, screen } from '@testing-library/react';
import { EmblemBase } from './emblem-base';
import { FALLBACK_URL } from '../config/';
import React from 'react';

describe('EmblemBase', () => {
  test('renders image with fallback URL when source is not provided', () => {
    render(<EmblemBase />);
    const imageElement = screen.getByAltText('Emblem');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', FALLBACK_URL);
  });

  test('renders image with provided source', () => {
    const src = 'https://example.com/image.png';
    render(<EmblemBase src={src} />);
    const imageElement = screen.getByAltText('Emblem');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', src);
  });

  test('renders image with provided alt text', () => {
    const alt = 'Custom Emblem';
    render(<EmblemBase alt={alt} />);
    const imageElement = screen.getByAltText(alt);
    expect(imageElement).toBeInTheDocument();
  });

  test('sets the fallback URL as the source when source fails to load', () => {
    const src = 'https://example.com/non-existent-image.png';
    render(<EmblemBase src={src} />);
    const imageElement = screen.getByAltText('Emblem');
    expect(imageElement).toBeInTheDocument();

    // Simulate the error event on the image element
    const errorEvent = new Event('error');
    imageElement.dispatchEvent(errorEvent);

    expect(imageElement).toHaveAttribute('src', FALLBACK_URL);
  });
});
