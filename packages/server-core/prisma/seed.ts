import { DownloadStates, hypertubeLogger, ParentTypes } from "@hypertube/libs";
import { User } from "@prisma/client";
import { v4 } from "uuid";
import { prisma } from "../src/index.js";

const createDefaultUsers = async () => {
  const users: User[] = [];

  const user1 = {
    id: v4(),
    name: "John Doe",
    email: "john@demo.com",
    emailVerified: true,
    username: "johndoe",
    displayUsername: "JohnDoe",
    firstName: "John",
    lastName: "Doe",
  };
  const user1Db = await prisma.user.upsert({
    where: {
      email: user1.email,
    },
    update: {},
    create: user1,
  });
  users.push(user1Db);

  const user2 = {
    id: v4(),
    name: "Jane Smith",
    email: "jane@demo.com",
    emailVerified: true,
    username: "janesmith",
    displayUsername: "JaneSmith",
    firstName: "Jane",
    lastName: "Smith",
  };
  const user2Db = await prisma.user.upsert({
    where: {
      email: user2.email,
    },
    update: {},
    create: user2,
  });
  users.push(user2Db);

  const user3 = {
    id: v4(),
    name: "Bob Wilson",
    email: "bob@demo.com",
    emailVerified: true,
    username: "bobwilson",
    displayUsername: "BobWilson",
    firstName: "Bob",
    lastName: "Wilson",
  };
  const user3Db = await prisma.user.upsert({
    where: {
      email: user3.email,
    },
    update: {},
    create: user3,
  });
  users.push(user3Db);

  return users;
};

const createDefaultMovie = async () => {
  const movie = await prisma.movie.upsert({
    where: {
      tmdbId: 0,
    },
    update: {
      demoMovie: true,
    },
    create: {
      tmdbId: 0,
      imdbId: "tt0",
      demoMovie: true,
    },
  });

  const resolutionData = {
    movieId: movie.id,
    resolution: "720p",
    size: "Many GB",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.resolution.upsert({
    where: {
      movieId_resolution: {
        movieId: movie.id,
        resolution: resolutionData.resolution,
      },
    },
    update: resolutionData,
    create: resolutionData,
  });

  const subtitleDataFrench = {
    movieId: movie.id,
    language: "fr",
    rating: 5,
    downloadLink: "https://example.com/fr",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.subtitle.upsert({
    where: {
      downloadLink: subtitleDataFrench.downloadLink,
    },
    update: subtitleDataFrench,
    create: subtitleDataFrench,
  });

  const subtitleDataEnglish = {
    movieId: movie.id,
    language: "en",
    rating: 5,
    downloadLink: "https://example.com/en",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.subtitle.upsert({
    where: {
      downloadLink: subtitleDataEnglish.downloadLink,
    },
    update: subtitleDataEnglish,
    create: subtitleDataEnglish,
  });

  return movie;
};

const createCommentsAndLikes = async (movieId: string, users: User[]) => {
  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: users[0].id,
        parentId: movieId,
      },
    },
    update: {},
    create: {
      id: v4(),
      userId: users[0].id,
      parentId: movieId,
      parentType: ParentTypes.MOVIE,
    },
  });
  const comment1 = {
    id: users[0].id,
    userId: users[0].id,
    parentId: movieId,
    parentType: ParentTypes.MOVIE,
    content: "This movie was so great I need to tell everyone about it!",
  };
  await prisma.comment.upsert({
    where: {
      id: users[0].id,
    },
    update: {},
    create: comment1,
  });

  const comment2 = {
    id: users[1].id,
    userId: users[1].id,
    parentId: comment1.id,
    parentType: ParentTypes.COMMENT,
    content: "I totally agree with you, this movie is great!",
  };
  await prisma.comment.upsert({
    where: {
      id: comment2.id,
    },
    update: {},
    create: comment2,
  });
  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: users[1].id,
        parentId: comment1.id,
      },
    },
    update: {},
    create: {
      id: v4(),
      userId: users[1].id,
      parentId: comment1.id,
      parentType: ParentTypes.COMMENT,
    },
  });

  const comment3 = {
    id: users[2].id,
    userId: users[2].id,
    parentId: comment1.id,
    parentType: ParentTypes.COMMENT,
    content: "Borrrinnnggggg",
  };
  await prisma.comment.upsert({
    where: {
      id: comment3.id,
    },
    update: {},
    create: comment3,
  });
};

const main = async () => {
  try {
    hypertubeLogger.info("Starting seed...");

    const users = await createDefaultUsers();
    hypertubeLogger.info("Users created successfully!");

    const movie = await createDefaultMovie();
    hypertubeLogger.info("Movie created successfully!");

    await createCommentsAndLikes(movie.id, users);
    hypertubeLogger.info("Comments and likes created successfully!");

    hypertubeLogger.info("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    hypertubeLogger.error(`Seed failed: ${error}`);
    process.exit(1);
  }
};

main();
