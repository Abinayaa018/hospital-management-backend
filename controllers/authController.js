const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

const signUpUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;
    const existing = await User.findOne({ email });

    if (existing) return res.status(409).json({ message: "Email already registered" });

    const savedUser = await new User({
      firstname,
      lastname,
      email,
      password,
      role: role || "Patient",
    }).save();

    res.status(201).json({ message: "User created successfully", data: savedUser });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid password" });
    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not registered as a ${role}` });
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.status(200).json({
      name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
      email: user.email,
      role: user.role || "Patient",
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signUpUser, loginUser };
