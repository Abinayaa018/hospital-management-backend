const User = require('./UserModel');

// REGISTER
const SignUpUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const newUser = new User({ firstname, lastname, email, password, role });
        const savedUser = await newUser.save();

        res.status(201).json({ message: 'User created successfully', data: savedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// LOGIN
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.password !== password) return res.status(401).json({ message: 'Invalid password' });

        res.status(200).json({
            name: `${user.firstname} ${user.lastname}`.trim(),
            email: user.email,
            role: user.role || 'User'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// READ ALL
const GetAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            data: users
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// READ ONE
const GetUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// UPDATE
const UpdateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// DELETE
const DeleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    SignUpUser,
    GetAllUsers,
    GetUserById,
    UpdateUser,
    DeleteUser
};