import PaymentVerification from './components/payment/PaymentVerification' // Import the main payment verification component

// Main App component
function App() {
  return (
    // Root div with App class
    <div className="App">
      <PaymentVerification /> {/* Render the payment verification component */}
    </div>
  )
}

export default App // Export the App component as default