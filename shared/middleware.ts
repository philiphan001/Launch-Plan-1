import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { fromZodError } from "zod-validation-error";

interface ValidateRequest {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateRequest(schema: ValidateRequest) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: validationError.message,
          errors: error.errors,
        });
      }
      
      next(error);
    }
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // For demonstration purposes, check if user is in session
  // In a production app, you would use proper authentication
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({ message });
}
