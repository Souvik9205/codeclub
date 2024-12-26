import ArenaPage from "./pages/arena";
import Dashboard from "./pages/dashboard";
import LandingPage from "./pages/landing";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./middleware/auth";
import Space from "./pages/space";
import Admin from "./pages/Admin";
import Signin from "./pages/auth/sign-in";
import Signup from "./pages/auth/sign-up";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/space" element={<Space />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/arena" element={<ArenaPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
