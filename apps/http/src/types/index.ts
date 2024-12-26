import z from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  type: z.enum(["user", "admin"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
  userId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string().optional(),
});

export const JoinSpaceSchema = z.object({
  userId: z.string(),
  spaceId: z.string(),
});

export const AddElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const UpdateElementSchema = z.object({
  imageUrl: z.string(),
});

export const CreateAvatarSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});

export const DeleteElementSchema = z.object({
  id: z.string(),
});

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: "Admin" | "User";
    }
  }
}