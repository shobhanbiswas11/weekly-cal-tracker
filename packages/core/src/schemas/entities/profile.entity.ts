import z from "zod";
import { schemaCreateProfile } from "../dtos/create-profile.dto";

export const schemaProfileEntity = schemaCreateProfile.extend({
  id: z.string(), // this will be the user id
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
