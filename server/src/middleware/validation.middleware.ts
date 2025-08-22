import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: "Données invalides",
			details: errors.array().map(err => ({
				field: "path" in err ? err.path : "unknown",
				message: err.msg
			}))
		});
	}
	next();
};

export const validateLogin = [
	body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Le mot de passe doit contenir au moins 8 caractères")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
	handleValidationErrors
];

export const validateRegister = [
	body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Le mot de passe doit contenir au moins 8 caractères")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
	body("firstName")
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Le prénom doit contenir entre 2 et 50 caractères")
		.matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
		.withMessage("Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
	body("lastName")
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Le nom doit contenir entre 2 et 50 caractères")
		.matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
		.withMessage("Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
	handleValidationErrors
];

export const validateProject = [
	body("name")
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage("Le nom du projet doit contenir entre 1 et 100 caractères")
		.escape(),
	body("description")
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage("La description ne peut pas dépasser 500 caractères")
		.escape(),
	handleValidationErrors
];

export const validateTask = [
	body("title")
		.trim()
		.isLength({ min: 1, max: 200 })
		.withMessage("Le titre de la tâche doit contenir entre 1 et 200 caractères")
		.escape(),
	body("description")
		.optional()
		.trim()
		.isLength({ max: 1000 })
		.withMessage("La description ne peut pas dépasser 1000 caractères")
		.escape(),
	body("status").isIn(["TODO", "IN_PROGRESS", "DONE"]).withMessage("Le statut doit être TODO, IN_PROGRESS ou DONE"),
	body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]).withMessage("La priorité doit être LOW, MEDIUM ou HIGH"),
	handleValidationErrors
];

export const validateUserUpdate = [
	body("firstName")
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Le prénom doit contenir entre 2 et 50 caractères")
		.matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
		.withMessage("Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
	body("lastName")
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Le nom doit contenir entre 2 et 50 caractères")
		.matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
		.withMessage("Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
	handleValidationErrors
];

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
	if (req.body) {

		Object.keys(req.body).forEach(key => {
			// eslint-disable-next-line security/detect-object-injection
			if (typeof req.body[key] === "string") {
				// eslint-disable-next-line security/detect-object-injection
				req.body[key] = req.body[key].trim();
			}
		});
	}
	next();
};
