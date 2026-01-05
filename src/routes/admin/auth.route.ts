// import { Router } from "express";
// import { Request, Response } from "express";
// import { UserRepository } from "../../repositories/user.repository";
// import bcryptjs from "bcryptjs";

// const router = Router();
// const userRepository = new UserRepository();

// router.post("/login", async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const adminUser = await userRepository.getUserByEmail(email);

//     // Check if user exists and is an admin
//     if (!adminUser || adminUser.role !== "admin") {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // Verify password
//     const isValid = await bcryptjs.compare(password, adminUser.password);
//     if (!isValid) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // Success message only
//     return res.status(200).json({ success: true, message: "welcome to admin" });
//   } catch (err: any) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;
