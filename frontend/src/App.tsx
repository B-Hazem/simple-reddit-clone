import { useEffect, useState } from "react"
import './index.css'

function App() {
  const [message, setMessage] = useState(null)


  useEffect(() => {
    fetch("http://localhost:3000/")
    .then(response => response.json())
    .then(data => setMessage(data.message))
    .catch(err => console.error(err))
  }, [])

  return (
    <>
    <p className="text-sm text-center">Message from backend /</p>
    <p className="text-center italic">
        {message}
    </p>
    </>
  )
}

export default App
