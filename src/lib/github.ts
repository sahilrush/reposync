import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aiSummarieCommit } from "./gemini";
import axios from "axios";


export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorAvatar: string;
  commitDate: Date;
  commitAuthorName: string;
  commitListCount:string;
  listCommitCount: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  console.log("-----------------------------------");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  console.log(getCommitHashes, "_____----___----____");

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
    commitListCount: commit.commit?.author?.date ?? "",
    listCommitCount: commit.commit?.author?.date ?? "",
  }));
};
export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGitHubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((x) => {
      return summariseCommit(githubUrl, x.commitHash);

    }),
  );

  const summaries = summaryResponses.map((x) => {
    if (x.status === "fulfilled") {
      return x.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
        listCommitCount: unprocessedCommits[index]!.listCommitCount,
      };
    }),
  });
  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  // Get the diff and pass the diff into AI
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return (await aiSummarieCommit(data)) || "";
}

async function fetchProjectGitHubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub URL");
  }

  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  // Fetch commits that have already been processed
  const processedCommits = await db.commit.findMany({
    where: {
      projectId, // Use the correct field name here
    },
  });

  // Filter out commits that have already been processed
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}



export const getCommitCount = async(githubUrl:string) => {


  const [owner,repo ] =githubUrl.split('/').slice(-2);
  if(!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  }

  let totalCommits = 0;
  let page = 1;

  while(true) {
    const {data} = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page:100,
      page
    });
    totalCommits += data.length;

   if(data.length < 100) {
    break;
   }
   page++;

  }
return totalCommits;
}


export const getContributors = async (githubUrl:string) => {
  const [owner,repo ] = githubUrl.split('/').slice(-2);
  if(!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  } 

  let contributors: any[] = []
  let page=1


  while(true) {
    const {data} = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page:100,
      page
    })

    contributors = [
      ...contributors,
      ...data.map((contributors) => ({
        login:contributors.login,
        avatarUrl:contributors.avatar_url,
        htmlUrl:contributors.html_url
      })),
    ]
    if(data.length < 100) {
      break;
    }
    page++;
  }
  return contributors
}

export const getTotalFilesCount = async (githubUrl:string) => {
  const [owner,repo] = githubUrl.split('/').slice(-2);
  if(!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  }
  let totalFiles = 0;

  const getRepoContent = async(path:string = '') => {
    const {data} = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    })
  


  if(Array.isArray(data)) {
    for(const item of data) {
      if(item.type === 'file') {
        totalFiles +=1;
      }else if (item.type === 'dir') {
        await getRepoContent(item.path)
      }
    }

  }
}

await getRepoContent();
return totalFiles;
} 