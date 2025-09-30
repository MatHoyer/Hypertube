import { DownloadStates, hypertubeLogger, ParentTypes } from "@hypertube/libs";
import { prisma } from "../src/index.js";

const createDefaultUsers = async () => {
  // Create demo users
  const user1 = await prisma.user.upsert({
    where: {
      id: "demo-user-1",
    },
    update: {},
    create: {
      id: "demo-user-1",
      name: "John Doe",
      email: "john@demo.com",
      emailVerified: true,
      username: "johndoe",
      displayUsername: "JohnDoe",
      firstName: "John",
      lastName: "Doe",
    },
  });

  const user2 = await prisma.user.upsert({
    where: {
      id: "demo-user-2",
    },
    update: {},
    create: {
      id: "demo-user-2",
      name: "Jane Smith",
      email: "jane@demo.com",
      emailVerified: true,
      username: "janesmith",
      displayUsername: "JaneSmith",
      firstName: "Jane",
      lastName: "Smith",
    },
  });

  const user3 = await prisma.user.upsert({
    where: {
      id: "demo-user-3",
    },
    update: {},
    create: {
      id: "demo-user-3",
      name: "Bob Wilson",
      email: "bob@demo.com",
      emailVerified: true,
      username: "bobwilson",
      displayUsername: "BobWilson",
      firstName: "Bob",
      lastName: "Wilson",
    },
  });

  return { user1, user2, user3 };
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

const createCommentsAndLikes = async (
  movie: any,
  users: { user1: any; user2: any; user3: any }
) => {
  const { user1, user2, user3 } = users;
  const allUsers = [user1, user2, user3];

  const now = new Date();

  const movieParentId = movie.id;
  const commentPromises = Array.from({ length: 20 }, (_, i) => {
    const randomUser = allUsers[i % 3];

    return prisma.comment.create({
      data: {
        content: `This is comment number ${i + 1}. Great movie!`,
        userId: randomUser.id,
        parentId: movieParentId,
        parentType: ParentTypes.MOVIE,
        createdAt: now,
        updatedAt: now,
      },
    });
  });

  const comments = await Promise.all(commentPromises);
  hypertubeLogger.info(`Created ${comments.length} comments`);

  const comment1 = await prisma.comment.upsert({
    where: {
      id: "ff3d0e70-b697-4097-823b-ac4636d68ee1",
    },
    update: {
      content: "This is an amazing movie! Highly recommended.",
      userId: user1.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
      updatedAt: now,
    },
    create: {
      id: "ff3d0e70-b697-4097-823b-ac4636d68ee1",
      content: "This is an amazing movie! Highly recommended.",
      userId: user1.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
      createdAt: now,
      updatedAt: now,
    },
  });

  const comment2 = await prisma.comment.upsert({
    where: {
      id: "ff3d0e70-b697-4097-823b-ac4636d68ff1",
    },
    update: {
      content: "Great cinematography and storyline!",
      userId: user2.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
      updatedAt: now,
    },
    create: {
      id: "ff3d0e70-b697-4097-823b-ac4636d68ff1",
      content: "Great cinematography and storyline!",
      userId: user2.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
      createdAt: now,
      updatedAt: now,
    },
  });

  const comment3 = await prisma.comment.upsert({
    where: {
      id: "demo-comment-3",
    },
    update: {
      content: "I totally agree! The acting was superb too.",
      userId: user3.id,
      parentId: comment1.id,
      parentType: ParentTypes.COMMENT,
      updatedAt: now,
    },
    create: {
      id: "demo-comment-3",
      content: "I totally agree! The acting was superb too.",
      userId: user3.id,
      parentId: comment1.id,
      parentType: ParentTypes.COMMENT,
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: user1.id,
        parentId: movieParentId,
      },
    },
    update: {
      parentType: ParentTypes.MOVIE,
    },
    create: {
      userId: user1.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: user2.id,
        parentId: movieParentId,
      },
    },
    update: {
      parentType: ParentTypes.MOVIE,
    },
    create: {
      userId: user2.id,
      parentId: movieParentId,
      parentType: ParentTypes.MOVIE,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: user2.id,
        parentId: comment1.id,
      },
    },
    update: {
      parentType: ParentTypes.COMMENT,
    },
    create: {
      userId: user2.id,
      parentId: comment1.id,
      parentType: ParentTypes.COMMENT,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: user3.id,
        parentId: comment1.id,
      },
    },
    update: {
      parentType: ParentTypes.COMMENT,
    },
    create: {
      userId: user3.id,
      parentId: comment1.id,
      parentType: ParentTypes.COMMENT,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_parentId: {
        userId: user1.id,
        parentId: comment2.id,
      },
    },
    update: {
      parentType: ParentTypes.COMMENT,
    },
    create: {
      userId: user1.id,
      parentId: comment2.id,
      parentType: ParentTypes.COMMENT,
    },
  });
};

const main = async () => {
  try {
    hypertubeLogger.info("Starting seed...");

    const users = await createDefaultUsers();
    hypertubeLogger.info("Users created successfully!");

    const movie = await createDefaultMovie();
    hypertubeLogger.info("Movie created successfully!");
    console.log("movie object:", movie);
    console.log("movie.id (type):", movie.id, typeof movie.id);

    await createCommentsAndLikes(movie, users);
    hypertubeLogger.info("Comments and likes created successfully!");

    hypertubeLogger.info("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    hypertubeLogger.error(`Seed failed: ${error}`);
    process.exit(1);
  }
};

main();
