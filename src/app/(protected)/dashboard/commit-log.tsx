"use client";

import UseProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, GitCommit } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = UseProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });

  const totalCount = commits?.totalCount;

  return (
    <>
      <div className="flex max-w-[15vw] items-center rounded-md border p-3 text-white shadow-md">
        <GitCommit className="mr-3 size-5 text-black" />
        <div>
          <div className="text-lg font-semibold text-gray-950">
            Total Commits
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {totalCount}
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
