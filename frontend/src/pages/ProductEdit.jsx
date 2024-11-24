import { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../other/UserContext.jsx';

const ProductEdit = () => {
    const navigate = useNavigate();

    const { productId } = useParams();
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        description: '',
    });

    const { permissions } = useContext(UserContext);

    // Fetch product details (simulate API call)
    useEffect(() => {
        const fetchProductDetails = async () => {
            const product = await fetch(`/api/products/${productId}`).then(
                (res) => res.json()
            );
            setProductData(product);
        };

        fetchProductDetails();
    }, [productId]);

    // Redirect if the user lacks permissions
    if (permissions['update-product'] === false) {
        return navigate(`/product/${productId}`);
    }

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                navigate(`/product/${productId}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Edit Product</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={productData.name}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Price:
                        <input
                            type="number"
                            name="price"
                            value={productData.price}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description:
                        <textarea
                            name="description"
                            value={productData.description}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default ProductEdit;
