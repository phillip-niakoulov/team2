import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './src/pages/Home.jsx';
import Login from './src/pages/Login.jsx';
import Register from './src/pages/Register.jsx';
import ProductView from './src/pages/ProductView.jsx';
import Header from './src/components/Header.jsx';
import './src/styles/index.css';
import './src/styles/pages/header.css';
import './src/styles/pages/home.css';
import './src/styles/pages/login.css';
import './src/styles/pages/register.css';
import NotFound from './src/pages/NotFound.jsx';
import AdminDashboard from './src/pages/AdminDashboard.jsx';
import ProductEdit from './src/pages/ProductEdit.jsx';
import Cart from './src/pages/Cart.jsx';
import { UserContext } from './src/other/UserContext.jsx';
import { jwtDecode } from 'jwt-decode';
import ProfileView from './src/pages/ProfileView.jsx';
import OrderList from './src/pages/OrderList.jsx';
import OrderView from './src/pages/OrderView.jsx';

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState('');
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        try {
            setLoggedIn(localStorage.getItem('token') !== null);
            if (loggedIn) {
                const token = jwtDecode(localStorage.getItem('token'));
                if (token['permissions'].length < 8) {
                    localStorage.removeItem('token');
                    setLoggedIn(false);
                    return;
                }
                setPermissions(token['permissions']);

                setUserId(token['userId']);
            }
        } catch (e) {
            console.log(e);
            setLoggedIn(false);
            setUserId('');
            setPermissions({});
            localStorage.removeItem('token');
        }
    }, [loggedIn, setLoggedIn, setPermissions, setUserId]);
    const context = useMemo(() => {
        return {
            loggedIn,
            setLoggedIn,
            userId,
            setUserId,
            permissions,
            setPermissions,
        };
    }, [loggedIn, setLoggedIn, userId, permissions, setUserId, setPermissions]);

    return (
        <Router>
            <UserContext.Provider value={context}>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                        path="product/:productId"
                        element={<ProductView />}
                    />
                    <Route
                        path="product/:productId/edit"
                        element={<ProductEdit />}
                    />
                    <Route path={'cart'} element={<Cart />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="user/:user" element={<ProfileView />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="order/:order" element={<OrderView />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </UserContext.Provider>
        </Router>
    );
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);

export default App;
