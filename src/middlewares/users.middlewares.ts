import { Request, Response, NextFunction } from "express";

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required!" });
    return;
  }
  next();
}

