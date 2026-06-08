import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Certificate from './pages/Certificate';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseEditor from './pages/CourseEditor';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { About, Careers, Press, Terms, Privacy, GenericFooterPage } from './pages/StaticPages';

function App() {
  return (
    <Router>
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/learners" element={<GenericFooterPage title="Learners Community" />} />
            <Route path="/partners" element={<GenericFooterPage title="Partners" />} />
            <Route path="/teaching-center" element={<GenericFooterPage title="Teaching Center" />} />
            <Route path="/investors" element={<GenericFooterPage title="Investors" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/learn/:id" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
            <Route path="/certificate/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/instructor" element={<ProtectedRoute requireInstructor><InstructorDashboard /></ProtectedRoute>} />
            <Route path="/instructor/course/:id/edit" element={<ProtectedRoute requireInstructor><CourseEditor /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
