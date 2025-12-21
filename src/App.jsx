import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChatList from "./pages/ChatList.jsx";
import ProtectedRoute from "./components/ProtectRoute/ProtectedRoute.jsx";
import './App.css'
import { Toaster } from "sonner";
import Hero from './pages/Hero.jsx';
import { SidebarProvider } from "./components/ui/sidebar.jsx";

function App() {
    return (
        <>
            <SidebarProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Hero />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/chat-list" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
                    </Routes>
                </BrowserRouter>
            </SidebarProvider>
            <Toaster position="top-right" />
        </>
    );
}

export default App;
