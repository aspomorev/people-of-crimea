import './RouteReadyGate.css'

function RouteReadyGate({ ready, children }) {
  return (
    <div className={`route-ready-gate${ready ? ' route-ready-gate_ready' : ''}`}>
      {children}
    </div>
  )
}

export default RouteReadyGate
