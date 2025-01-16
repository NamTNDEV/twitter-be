import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/user.requests';
import userService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  res.json({ message: "Login successful!" });
  return;
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const newUser = req.body;

  try {
    const createdUser = await userService.createUser(newUser);
    res.status(201).json({ message: "User created successfully!", data: createdUser });
  } catch (error) {
    res.status(500).json({ message: "User created failure!", data: null });
    return
  };
}