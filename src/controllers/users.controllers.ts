import { Request, Response } from 'express';
import userService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  res.json({ message: "Login successful!" });
  return;
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required!", data: null });
    return;
  }

  try {
    const createdUser = await userService.createUser({ email, password });
    res.status(201).json({ message: "User created successfully!", data: createdUser });
  } catch (error) {
    res.status(500).json({ message: "User created failure!", data: null });
    return
  };
}