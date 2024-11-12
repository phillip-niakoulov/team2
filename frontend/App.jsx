import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './src/pages/home.jsx';
import Login from './src/pages/Login.jsx';
import Register from './src/pages/Register.jsx';
import Header from './src/components/Header.jsx';
import ProductCreate from './src/pages/ProductCreate.jsx';
import NotFound from './src/pages/NotFound.jsx';

// import Footer from '../components/footer';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="product/create" element={<ProductCreate />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    </StrictMode>
);
