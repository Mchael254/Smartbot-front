import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Landing from "./pages/landing";
import NotFound from "./pages/notFound";
import Login from "./pages/login";
import Signup from "./pages/signup";
import User from "./pages/user";
import AuthGuard from "./components/authGuard";
import Admin from "./pages/admin";


const App = () => (
  <BrowserRouter>

    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<AuthGuard roles={['admin']}><Admin /></AuthGuard>}
        path="/admin"
      />

      <Route path="/user" element={
        <AuthGuard roles={['user', 'admin']}>
          <User />
        </AuthGuard>
      }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>

  </BrowserRouter>
);

export default App;