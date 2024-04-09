import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { SubRedditRoute } from './routes/subredditRoute'
import { UserRoute } from './routes/userRoute'
import SubRedditAdminRoute from './routes/subredditAdminRoute'
import { Toaster } from 'sonner'
import { IsAuthWrapper } from './components/IsAuthWrapper'
import { PostRoute } from './routes/postRoute'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/:subRedditName",
    element: <SubRedditRoute />
  },
  {
    path: "/:subRedditName/admin",
    element: <SubRedditAdminRoute />
  },
  {
    path: "/post/:postId",
    element: <PostRoute/>
  },
  {
    path: "/user/:userId",
    element: <UserRoute />
  }

])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position='bottom-left' closeButton richColors/>
    <main className="text-text">
      <div className="m-0 p-0">
          <a href='/' className="font-semibold text-3xl m-0 p-0">simple-reddit-clone</a>
      </div>

      <IsAuthWrapper children=<RouterProvider router={router} /> />     
      
    </main>

  </React.StrictMode>,
)
