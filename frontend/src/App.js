import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SessionList from "./components/SessionList";
import SessionTimeline from "./components/SessionTimeline.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/session/:id" element={<SessionTimeline />} />
      </Routes>
    </Router>
  );
};

export default App;
