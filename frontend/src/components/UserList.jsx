import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../other/UserContext.jsx';
import { Link } from 'react-router-dom';

const UserList = () => {
    // State Initialization
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modifiedPermissions, setModifiedPermissions] = useState({});
    const [changesMade, setChangesMade] = useState({});
    const [hasManagePermissions, setHasManagePermissions] = useState(false);
    const [hasDeletePermissions, setHasDeletePermissions] = useState(true);

    const { permissions, userId } = useContext(UserContext);
    // Decode Token and Check Permissions
    useEffect(() => {
        try {
            setHasManagePermissions(permissions['manage-permissions']);
            setHasDeletePermissions(permissions['delete-users']);
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }, [permissions]);

    // Fetch Users Logic
    const getUsers = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BACKEND_URL}/api/users`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Network response was not ok');

            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        const response = await fetch(
            `${import.meta.env.VITE_API_BACKEND_URL}/api/users/${userId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await getUsers();
        setUsers(result);

        return await response.json();
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const result = await getUsers();
                setUsers(result);

                const initialPermissions = result.reduce((acc, user) => {
                    acc[user._id] = { ...user.permissions };
                    return acc;
                }, {});

                const initialChanges = result.reduce((acc, user) => {
                    acc[user._id] = false;
                    return acc;
                }, {});

                setModifiedPermissions(initialPermissions);
                setChangesMade(initialChanges);
            } catch (err) {
                console.error('Error setting users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Permission Handlers
    const handleCheckboxChange = (userId, permission) => {
        if (!hasManagePermissions) return;

        setModifiedPermissions((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [permission]: !prev[userId][permission],
            },
        }));

        setChangesMade((prev) => ({
            ...prev,
            [userId]: true,
        }));
    };

    const handleConfirmChanges = async (user) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BACKEND_URL}/api/users/${user}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                    body: JSON.stringify({
                        permissions: modifiedPermissions[user],
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to update permissions');

            const updatedUser = await response.json();

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === updatedUser ? updatedUser : user
                )
            );

            setModifiedPermissions((prev) => ({
                ...prev,
                [updatedUser]: { ...updatedUser.permissions },
            }));

            setChangesMade((prev) => ({
                ...prev,
                [user]: false,
            }));
        } catch (error) {
            console.error('Error updating permissions:', error);
        }
    };

    // Rendering Logic
    if (loading) {
        return <p>Loading users...</p>;
    }

    const renderUserPermissions = (user) =>
        Object.keys(user.permissions).map((permission) => (
            <div key={permission}>
                <label>
                    <input
                        type="checkbox"
                        checked={
                            modifiedPermissions[user._id]?.[permission] || false
                        }
                        onChange={() =>
                            handleCheckboxChange(user._id, permission)
                        }
                        disabled={!hasManagePermissions || user._id === userId} // Disable if user lacks permission
                        style={{
                            cursor: hasManagePermissions
                                ? 'pointer'
                                : 'not-allowed',
                        }}
                    />
                    {permission}
                    {hasManagePermissions}
                </label>
            </div>
        ));

    const renderUsers = () =>
        users.map((user) => (
            <tr key={user._id}>
                <td>
                    <Link to={`/user/${user._id}`}>{user._id}</Link>
                </td>
                <td>{user.username}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                    {renderUserPermissions(user)}
                    {changesMade[user._id] && hasManagePermissions && (
                        <button onClick={() => handleConfirmChanges(user._id)}>
                            Confirm Changes
                        </button>
                    )}
                </td>
                <td>
                    <button
                        onClick={() => deleteUser(user._id)}
                        disabled={!hasDeletePermissions || userId === user._id}
                        style={{
                            cursor: hasDeletePermissions
                                ? 'pointer'
                                : 'not-allowed',
                        }}
                    >
                        X
                    </button>
                </td>
            </tr>
        ));

    return (
        <div>
            <h2>User List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Created At</th>
                        <th>Permissions</th>
                        <th>Delete User</th>
                    </tr>
                </thead>
                <tbody>{renderUsers()}</tbody>
            </table>
        </div>
    );
};

export default UserList;
