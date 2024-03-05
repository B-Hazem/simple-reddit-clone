import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { SubRedditRoute } from './routes/subredditRoute'
import { Toaster } from 'sonner'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />
  },
  {
    path: "/:subRedditName",
    element: <SubRedditRoute />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position='bottom-left' closeButton richColors/>
    <main className="text-text">
      <div className="m-0 p-0">
          <a href='/' className="font-semibold text-3xl m-0 p-0">simple-reddit-clone</a>
      </div>
      <RouterProvider router={router} />
    </main>

  </React.StrictMode>,
)
