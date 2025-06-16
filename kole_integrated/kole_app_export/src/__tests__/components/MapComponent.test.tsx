// src/__tests__/components/MapComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MapComponent from '../../components/MapComponent';

// Mock pour mapboxgl
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
    getCanvas: jest.fn(() => ({
      style: {}
    })),
    getCenter: jest.fn(() => ({ lat: 0, lng: 0 })),
    getZoom: jest.fn(() => 10),
    getStyle: jest.fn(() => ({})),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    flyTo: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  GeolocateControl: jest.fn(),
}));

describe('MapComponent', () => {
  test('renders without crashing', () => {
    render(
      <MapComponent
        latitude={0}
        longitude={0}
        zoom={10}
        style={{ width: '100%', height: '400px' }}
      />
    );
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
  
  test('renders with markers', () => {
    render(
      <MapComponent
        latitude={0}
        longitude={0}
        zoom={10}
        style={{ width: '100%', height: '400px' }}
        markers={[
          { id: '1', latitude: 1, longitude: 1, color: 'red' },
          { id: '2', latitude: 2, longitude: 2, color: 'blue' }
        ]}
      />
    );
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
});
