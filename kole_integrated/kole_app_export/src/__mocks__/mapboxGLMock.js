// Mock pour Mapbox GL
const mapboxgl = {
  Map: jest.fn().mockImplementation(() => ({
    addControl: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'load') {
        callback();
      }
    }),
    remove: jest.fn(),
    getLayer: jest.fn().mockReturnValue(false),
    getSource: jest.fn().mockReturnValue(false),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  GeolocateControl: jest.fn(),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setPopup: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  Popup: jest.fn().mockImplementation(() => ({
    setText: jest.fn().mockReturnThis(),
  })),
  accessToken: '',
};

module.exports = mapboxgl;
