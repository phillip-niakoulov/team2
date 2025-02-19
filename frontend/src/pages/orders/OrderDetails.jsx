import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/components/OrderDetails.css';
import { UserContext } from '../../other/UserContext.jsx';
import OrderStatus from '../../other/OrderStatus.jsx';

const fetchOrderDetails = async (orderId) => {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_BACKEND_URL}/api/orders/${orderId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return res.json();
    } catch (err) {
        console.error('Error fetching order details:', err);
        return null;
    }
};

const OrderDetails = ({ orderId }) => {
    OrderDetails.propTypes = {
        orderId: PropTypes.string,
    };

    const [details, setDetails] = useState(null);
    const { permissions } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const data = await fetchOrderDetails(orderId);
            setDetails(data);
            setLoading(false);
        };
        fetchDetails();
    }, [orderId]);

    if (loading) {
        return <div className="info">Loading details...</div>;
    }

    if (!details) {
        return <div>Error loading order details.</div>;
    }

    const createStatusButton = () => {
        if (!permissions['update-orders']) return null;
        return (
            <div>
                <label htmlFor={`${details._id}status`}> Status:</label>
                <select
                    className={'order-summary'}
                    id={`${details._id}status`}
                    onChange={() => {
                        document.getElementById(
                            `${details._id}save`
                        ).hidden = false;
                    }}
                    defaultValue={details.order_status?.status}
                >
                    {Object.values(OrderStatus).map((statusOption) => (
                        <option
                            key={`${details._id}${statusOption['value']}`}
                            value={statusOption['value']}
                        >
                            {statusOption['text']}
                        </option>
                    ))}
                </select>
                <button
                    className={'order-summary'}
                    hidden={true}
                    onClick={async () => {
                        const newStatus = document.getElementById(
                            `${details._id}status`
                        ).value;
                        const data = await fetch(
                            `${
                                import.meta.env.VITE_API_BACKEND_URL
                            }/api/orders/${details._id}`,
                            {
                                method: 'PUT',
                                body: JSON.stringify({ status: newStatus }),
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${localStorage.getItem(
                                        'token'
                                    )}`,
                                },
                            }
                        );
                        if (data.status === 201) {
                            document.getElementById(
                                `${details._id}save`
                            ).hidden = true;
                        }
                    }}
                    id={`${details._id}save`}
                >
                    Save
                </button>
            </div>
        );
    };
    return (
        <div className="order-details-container">
            <h4 className="order-details-heading">Order Details</h4>
            <ul className="order-items-list">
                {details.cart.map((item) => (
                    <li key={item.itemId} className="order-item">
                        <Link
                            to={`/product/${item.itemId}`}
                            className="item-link"
                        >
                            {item.name}
                        </Link>{' '}
                        - {item.quantity} x ${item.price.toFixed(2)} = $
                        {(item.quantity * item.price).toFixed(2)}
                    </li>
                ))}
            </ul>
            <div className="order-summary">
                <p>
                    <strong>Total Items:</strong>{' '}
                    {details.cart.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p>
                    <strong>Total Price:</strong> $
                    {details.cart
                        .reduce(
                            (sum, item) => sum + item.quantity * item.price,
                            0
                        )
                        .toFixed(2)}
                </p>
                {createStatusButton()}
            </div>
        </div>
    );
};

export default OrderDetails;
