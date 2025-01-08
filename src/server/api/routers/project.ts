import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getCommitCount, pollCommits } from "@/lib/github"; // Utility functions for GitHub commit count and polling
import { indexGithubRepo } from "@/lib/github-loader"; // Index the GitHub repo (optional, depending on your app's logic)

export const projectRouter = createTRPCRouter({
  // Create a new project with GitHub URL and Token
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });

      // Optionally, index the GitHub repo
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      
      // Poll and process commits for the project
      await pollCommits(project.id);  // This will process and store the commits

      return project;
    }),

  // Get all projects for the current user
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  // Get commits and total commit count for a specific project
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project?.githubUrl) {
        throw new Error("GitHub URL is not configured for this project.");
      }

      // Poll new commits and fetch total commit count concurrently
      const [commitCount, poll] = await Promise.all([
        getCommitCount(project.githubUrl), // Fetch total commits from GitHub
        pollCommits(input.projectId), // Process and store new commits
      ]);

      // Fetch all commits for this project from the database
      const commits = await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });

      return { commits, totalCount: commitCount };
    }),

  // Save the answer to a specific question for a project
  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),

  // Get questions for a project
  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
