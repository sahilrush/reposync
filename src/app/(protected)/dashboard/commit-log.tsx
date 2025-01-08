"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UseProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, GitCommit, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = UseProject();
  const { data: commits, isLoading } = api.project.getCommits.useQuery({
    projectId,
  });
  const { data: contributors } = api.project.getContributors.useQuery({
    projectId,
  });

  const totalCount = commits?.totalCount;

  return (
    <>
      <div className="flex flex-row flex-wrap items-center justify-start gap-4">
        <div className="flex w-max items-start rounded-md border p-3 text-white shadow-md">
          <GitCommit className="mr-3 size-5 text-black" />
          <div className="">
            <div className="text-lg font-semibold text-gray-950">
              Total Commits
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {totalCount}
            </div>
          </div>
        </div>

        <div className="flex w-max items-start rounded-md border p-3 text-white shadow-md">
          <Users className="mr-3 size-5 text-black" />
          <div className="">
            <div className="text-lg font-semibold text-gray-950">
              Contributors
            </div>
            <div
              className={cn(
                "flex w-full max-w-sm items-center justify-start gap-2 overflow-x-auto",
                {
                  "pl-4": (contributors?.length ?? 0) > 4,
                },
              )}
            >
              {contributors?.map((contributor) => (
                <Tooltip key={contributor.login}>
                  <TooltipTrigger className="hover:cursor-pointer">
                    <Link
                      target="_blank"
                      href={contributor.htmlUrl}
                      className="flex"
                    >
                      <Image
                        src={contributor.avatarUrl}
                        alt={contributor.login}
                        className="h-8 w-8 rounded-full !aspect-square"
                        width={100}
                        height={100}
                      />
                      <span className="text-transparent">11231</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {contributor.login} </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden items-center rounded-md border p-3 text-white shadow-md">
          <div className="flex items-center justify-start">
            <Users className="mr-3 size-5 text-black" />
            <h2 className="text-lg font-semibold text-gray-950">
              Contributors
            </h2>
          </div>
          <div className="flex w-full max-w-sm items-center justify-start gap-12 overflow-x-auto pl-5">
            {contributors?.map((contributor) => (
              <Link
                target="_blank"
                href={contributor.htmlUrl}
                key={contributor.login}
                className="flex items-center justify-center gap-2 transition-all duration-150 ease-in hover:scale-110 hover:cursor-pointer"
              >
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.login}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm text-gray-900 hover:underline">
                  {contributor.login}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-8 space-y-8">
        {commits?.commits.map((commit: any, commitIdx: any) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.commits.length - 1
                    ? "h-6"
                    : "-bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-gray-300"></div>
              </div>
              <>
                {}
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
                />
                <div className="rounded-mg flex-auto bg-white p-3 ring-1 ring-inset ring-gray-200">
                  <div className="justify-between-x-4 flex">
                    <Link
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="py-5 text-xs leading-5 text-gray-500"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex cursor-pointer items-center rounded-md px-2 py-1 hover:bg-gray-200">
                        commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                      {commit.commitDate
                        ? commit.commitDate.toString()
                        : "No date available"}
                    </Link>
                  </div>
                  <span className="font-semibold">{commit.commitMessage}</span>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                    {commit.summary ? commit.summary : "No summary available"}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
