import MapView from './components/MapView'

export default function App() {
  return (
    <div
      style={{
        padding: 20,
        background: '#222',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <h1>Warlords</h1>
      <MapView />
    </div>
  )
}