import {
  deleteCredentialsSchemas,
  getCredentialsSchemas,
  newUTCDate,
  postCredentialsSchemas,
  postTokenSchemas,
  TDeleteCredentialsSchemas,
  TPostCredentialsSchemas,
  TPostTokenSchemas,
} from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { addMinutes, differenceInMinutes, getTime } from "date-fns";
import { Context } from "hono";
import jwt from "jsonwebtoken";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getCredentials = async (c: Context<TIsLogged>) => {
  const { id: userId } = c.get("user");

  const credentials = await prisma.credential.findMany({
    where: {
      userId,
    },
    omit: {
      clientSecret: true,
    },
  });

  return c.json(getCredentialsSchemas.response.parse(credentials));
};

export const postCredentials = async (
  c: Context<TIsLogged & TBodyParser<TPostCredentialsSchemas["requirements"]>>
) => {
  const { id: userId } = c.get("user");
  const { name } = c.get("validatedBody");

  const clientId = "ci_" + crypto.randomBytes(20).toString("hex");
  const clientSecret = "cs_" + crypto.randomBytes(32).toString("hex");

  const hashedClientSecret = await bcrypt.hash(clientSecret, 10);

  await prisma.credential.create({
    data: {
      clientId,
      clientSecret: hashedClientSecret,
      userId,
      name,
    },
  });

  return c.json(
    postCredentialsSchemas.response.parse({ clientId, clientSecret })
  );
};

export const deleteCredentials = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteCredentialsSchemas["urlParams"]>
  >
) => {
  const { credentialId } = c.get("validatedUrlParams");
  const { id: userId } = c.get("user");

  await prisma.credential.delete({
    where: { id: credentialId, userId },
  });

  return c.json(
    deleteCredentialsSchemas.response.parse({ message: "Credential deleted" })
  );
};

export const postToken = async (
  c: Context<TBodyParser<TPostTokenSchemas["requirements"]>>
) => {
  const { clientId, clientSecret } = c.get("validatedBody");

  const credential = await prisma.credential.findFirst({
    where: {
      clientId,
    },
  });
  if (!credential) {
    return c.json({ message: "Credential not found" }, 404);
  }

  const hashedClientSecret = await bcrypt.hash(clientSecret, 10);
  const isMatch = await bcrypt.compare(clientSecret, hashedClientSecret);
  if (!isMatch) {
    return c.json({ message: "Invalid client secret" }, 401);
  }

  const now = newUTCDate();
  const expiresAt = addMinutes(now, 5);
  const token = jwt.sign(
    { credentialId: credential.id, expiresAt },
    env.BETTER_AUTH_SECRET,
    {
      expiresIn: getTime(differenceInMinutes(expiresAt, now)),
    }
  );

  return c.json(
    postTokenSchemas.response.parse({ token, expiresAt: getTime(expiresAt) })
  );
};
