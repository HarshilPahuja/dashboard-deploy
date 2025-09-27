import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Crowdsourcing from "./components/Crowdsourcing";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <nav className="main-navbar">
          <div className="navbar-left">
            <img src="/SIH2.webp" alt="Logo" className="navbar-logo" />
            <h1>Sudharshan Chakra Dashboard</h1>
          </div>

          <div className="navbar-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/crowdsourcing" className="nav-link">
              Crowdsourcing
            </Link>
          </div>

          <div className="header-right">
            <img src="/logo.jpg" alt="Team Logo" className="header-logo" />
            <span role="img" aria-label="call" className="call-emoji">
              📞
            </span>
          </div>
        </nav>

        {/* Page content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crowdsourcing" element={<Crowdsourcing />} />
        </Routes>
      </div>
    </Router>
  );
}
