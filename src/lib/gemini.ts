import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
}

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAi.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

export const aiSummarieCommit = async (diff: string): Promise<string> => {
    try {
        const response = await model.generateContent([
            `You are an expert programmer, and you are trying to summarize a git diff.
            Reminders about the git diff format:
            For every file, there are a few metadata lines, like (for example):
            \`\`\`
            diff --git a/lib/index.js b/lib/index.js
            index aadf691..bfef603 100644
            --- a/lib/index.js
            +++ b/lib/index.js
            \`\`\`
            This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
            Then there is a specifier of the lines that were modified.
            A line starting with \`+\` means it was added.
            A line starting with \`-\` means that line was deleted.
            A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
            It is not part of the diff.
            [...]
            EXAMPLE SUMMARY COMMENTS:
            \`\`\`
            * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
            * Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
            * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
            * Added on OpenAI for completion [packages/utils/apis/openai.ts]
            * Lowered numeric tolerance for test files
            \`\`\`
            Most commits will have fewer comments than this example list.
            The last comment does not include the file names,
            because there were more than two relevant files in the hypothetical commit.
            Do not include parts of the example in your summary.
            It is given only as an example of appropriate comments.`,
            `Please summarize the following diff file: \n\n${diff}`,
        ]);

        return response.response.text();
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary");
    }
}



// const commitDiff = `diff --git a/apps/backend/package.json b/apps/backend/package.json
// index e33622e..125b356 100644
// --- a/apps/backend/package.json
// +++ b/apps/backend/package.json
// @@ -11,10 +11,10 @@
//    "author": "",
//    "license": "ISC",
//    "devDependencies": {
// +    "@repo/db": "*",
//      "@types/bcryptjs": "^2.4.6",
//      "@types/estree": "^1.0.6",
// -    "@types/express": "^5.0.0",
// -    "@repo/db": "*"
// +    "@types/express": "^5.0.0"
//    },
//    "dependencies": {
//      "@repo/db": "*",
// diff --git a/apps/backend/src/actions/avatar.ts b/apps/backend/src/actions/avatar.ts
// new file mode 100644
// index 0000000..0220c6e
// --- /dev/null
// +++ b/apps/backend/src/actions/avatar.ts
// @@ -0,0 +1,18 @@
// +import client from "@repo/db/client"
// +import { Request, Response } from "express"
// +
// +export const getAllavatars = async (req: Request, res: Response) => {
// +    try {
// +      const avatars = await client.avatar.findMany();
// +      res.json({
// +        avatars: avatars.map((a:any) => ({
// +          id: a.id,
// +          name: a.name,
// +          imageUrl: a.imageUrl,
// +        })),
// +      });
// +    } catch (error) {
// +      console.error('Error fetching avatars:', error);
// +      res.status(500).json({ error: 'An error occurred while fetching avatars' });
// +    }
// +  };
// \ No newline at end of file
// diff --git a/apps/backend/src/actions/elements.ts b/apps/backend/src/actions/element.ts
// similarity index 50%
// rename from apps/backend/src/actions/elements.ts
// rename to apps/backend/src/actions/element.ts
// index 19b5cea..f4140c1 100644
// --- a/apps/backend/src/actions/elements.ts
// +++ b/apps/backend/src/actions/element.ts
// @@ -1,24 +1,9 @@
//  import client from "@repo/db/client"
//  import { Request, Response } from "express"
 
// -export const avatars = async (req: Request, res: Response) => {
// -    try {
// -      const avatars = await client.avatar.findMany();
// -      res.json({
// -        avatars: avatars.map((a:any) => ({
// -          id: a.id,
// -          name: a.name,
// -          imageUrl: a.imageUrl,
// -        })),
// -      });
// -    } catch (error) {
// -      console.error('Error fetching avatars:', error);
// -      res.status(500).json({ error: 'An error occurred while fetching avatars' });
// -    }
// -  };
 
 
// -  export const elements = async(req: Request, res: Response) => {
// +  export const getAllelements = async(req: Request, res: Response) => {
//      try {
//        const elements = await client.element.findMany();
//        res.json({
// diff --git a/apps/backend/src/actions/space.ts b/apps/backend/src/actions/space.ts
// index 83e9244..60cc09f 100644
// --- a/apps/backend/src/actions/space.ts
// +++ b/apps/backend/src/actions/space.ts
// @@ -116,7 +116,7 @@ export const getAllSpaces = async(req: Request, res: Response) => {
//  }
 
 
// -export const addElement = async(req: Request, res: Response) => {
// +export const addElementtoSpace = async(req: Request, res: Response) => {
//      const parsedData = AddElementSchema.safeParse(req.body)
//      if(!parsedData.success){
//          res.status(400).json({message: "Validation failed"})
// @@ -152,38 +152,10 @@ export const addElement = async(req: Request, res: Response) => {
 
 
 
// -export const deleteElement = async(req: Request, res: Response) => {   
// -    const parsedData = DeleteElementSchema.safeParse(req.body)
// -    if(!parsedData.success){
// -        res.status(400).json({message: "Validation failed"})
// -        return
// -    }
// -
// -    const spaceElement = await client.spaceElements.findFirst({
// -    where: {
// -        id: parsedData.data.id
// -    },
// -    include:{
// -        space: true,
// -    }
// -    })
// -
// -    if(!spaceElement?.space.creatorId || spaceElement?.space.creatorId !== req.userId){
// -        res.status(401).json({message: "Unauthorized"})
// -        return
// -    }
// -   
// -    await client.spaceElements.delete({
// -        where: {
// -            id: parsedData.data.id
// -        }
// -    })
// -    res.status(200).json({message: "Element deleted successfully"})
// -}
 
 
 
// -export const getSpaceElements = async (req: Request, res: Response) => {
// +export const getSpaceElementsbyId = async (req: Request, res: Response) => {
//      const space = await client.space.findUnique({
//          where: {
//              id: req.params.spaceId
// @@ -217,4 +189,34 @@ export const getSpaceElements = async (req: Request, res: Response) => {
//              y: e.y
//          })),
//      })
// -    }
// \ No newline at end of file
// +    }
// +
// +    export const deleteElement = async(req: Request, res: Response) => {   
// +        const parsedData = DeleteElementSchema.safeParse(req.body)
// +        if(!parsedData.success){
// +            res.status(400).json({message: "Validation failed"})
// +            return
// +        }
// +    
// +        const spaceElement = await client.spaceElements.findFirst({
// +        where: {
// +            id: parsedData.data.id
// +        },
// +        include:{
// +            space: true,
// +        }
// +        })
// +    
// +        if(!spaceElement?.space.creatorId || spaceElement?.space.creatorId !== req.userId){
// +            res.status(401).json({message: "Unauthorized"})
// +            return
// +        }
// +       
// +        await client.spaceElements.delete({
// +            where: {
// +                id: parsedData.data.id
// +            }
// +        })
// +        res.status(200).json({message: "Element deleted successfully"})
// +    }
// +    
// \ No newline at end of file
// diff --git a/apps/backend/src/actions/user.ts b/apps/backend/src/actions/user.ts
// index 457a670..0ba7f8d 100644
// --- a/apps/backend/src/actions/user.ts
// +++ b/apps/backend/src/actions/user.ts
// @@ -3,7 +3,7 @@ import { Request, Response } from "express"
//  import client from "@repo/db/client"
 
 
// -export const metaData = async(req:Request, res:Response) => {  
// +export const UpdateMetadata = async(req:Request, res:Response) => {  
//      const parsedData = UpdateMetadataSchema.safeParse(req.body)
//      if(!parsedData.success){
//       res.status(400).json({error: "Invalid data"})    
// @@ -21,7 +21,7 @@ export const metaData = async(req:Request, res:Response) => {
//  }
 
 
// -export const bulkMetaData = async(req:Request, res:Response) => {   
// +export const getbulkMetaData = async(req:Request, res:Response) => {   
//      const userIdString = (req.query.ids ?? "[]") as string;
//      const userIds = (userIdString).slice(1, userIdString?.length - 2).split(",");
 
// diff --git a/apps/backend/src/app.ts b/apps/backend/src/app.ts
// index 64dee73..212df27 100644
// --- a/apps/backend/src/app.ts
// +++ b/apps/backend/src/app.ts
// @@ -1,9 +1,6 @@
 
//  import express from  "express";
//  import { accountRouter } from "./routes/account";
// -// import { sideUrlRouter } from "./routes/sideUrl";
// -// import { spaceRouter } from "./routes/space";
// -
 
//  const app = express(); 
 
// @@ -14,12 +11,7 @@ app.get('/', (req,res) => {
//  });
 
 
// -
// -
// -
//  app.use('/api/v1', accountRouter);
// -// app.use('/api/v1',sideUrlRouter);
// -// app.use('/api/v1',spaceRouter);
 
 
//  export default app; 
// diff --git a/apps/backend/src/routes/ user.ts b/apps/backend/src/routes/ user.ts
// deleted file mode 100644
// index 6e5c05a..0000000
// --- a/apps/backend/src/routes/ user.ts	
// +++ /dev/null
// @@ -1,9 +0,0 @@
// -import { bulkMetaData, metaData } from "../actions/user";
// -import express from "express";  
// -import { userMiddleware } from "../middleware/user";
// -
// -
// -
// -export const userRouter = express.Router();
// -userRouter.get("/metadata",userMiddleware, metaData);
// -userRouter.get("/metadata/bulk", bulkMetaData);
// diff --git a/apps/backend/src/routes/admin.ts b/apps/backend/src/routes/admin.ts
// index d336662..4e7ca5c 100644
// --- a/apps/backend/src/routes/admin.ts
// +++ b/apps/backend/src/routes/admin.ts
// @@ -1,9 +1,11 @@
// -import { createAvatar, createElement, createMap, updateElement } from "../actions/admin";
// -import express from "express";  
// +import express from "express"
// +import { adminMiddleware } from "../middleware/admin"
// +import { createAvatar, createElement, createMap, updateElement } from "../actions/admin"
 
 
// -export const adminRouter = express.Router()
// -adminRouter.post("/element", createElement);
// -adminRouter.put("/element/:elementId", updateElement);
// -adminRouter.post("/avatar", createAvatar);
// -adminRouter.post("/map", createMap);
// \ No newline at end of file
// +const router = express.Router()
// +
// +router.post("/elements", adminMiddleware, createElement)
// +router.put("/element/:elementId", adminMiddleware, updateElement)
// +router.post("/avatar", adminMiddleware, createAvatar)
// +router.post("/map", adminMiddleware, createMap)
// \ No newline at end of file
// diff --git a/apps/backend/src/routes/elements.ts b/apps/backend/src/routes/elements.ts
// deleted file mode 100644
// index 348f7c2..0000000
// --- a/apps/backend/src/routes/elements.ts
// +++ /dev/null
// @@ -1,6 +0,0 @@
// -import { avatars, elements } from "../actions/elements";
// -import express from "express";
// -
// -export const elementsRouter = express.Router();
// -elementsRouter.get("/avatars", avatars);
// -elementsRouter.get("/elements", elements);
// \ No newline at end of file
// diff --git a/apps/backend/src/routes/index.ts b/apps/backend/src/routes/index.ts
// new file mode 100644
// index 0000000..642cf59
// --- /dev/null
// +++ b/apps/backend/src/routes/index.ts
// @@ -0,0 +1,22 @@
// +import express from "express"
// +import { signin, signup } from "../actions/account"
// +import { getAllelements } from "../actions/element"
// +import { getAllavatars } from "../actions/avatar"
// +import spaceRouter from "./space"
// +import adminRouter from "./user"
// +import userRouter from "./user"
// +
// +
// +const router = express.Router()
// +router.get("/health",(req,res)=>{
// +    res.send("API Server is running")
// +})
// +router.post("/signup",signup)
// +router.post("/signin",signin)
// +router.get("/avatars",getAllavatars)
// +router.get("/elements",getAllelements)
// +router.use("/user",userRouter)
// +router.use("/space",spaceRouter)
// +router.use("/admin",adminRouter)
// +
// +export default router;
// \ No newline at end of file
// diff --git a/apps/backend/src/routes/space.ts b/apps/backend/src/routes/space.ts
// index 5180d21..abefad1 100644
// --- a/apps/backend/src/routes/space.ts
// +++ b/apps/backend/src/routes/space.ts
// @@ -1,10 +1,15 @@
// -import express from "express";  
// -import { addElement, createSpace, deleteElement, getAllSpaces, getSpaceElements } from "../actions/space";
// +import express from "express"
//  import { userMiddleware } from "../middleware/user";
// +import {  addElementtoSpace, createSpace, deleteElement, deleteSpace, getAllSpaces,  getSpaceElementsbyId } from "../actions/space";
 
// -export const spaceRouter = express.Router();
// -spaceRouter.post('/',userMiddleware, createSpace);
// -spaceRouter.delete("/element", userMiddleware, deleteElement);
// -spaceRouter.get("/all", userMiddleware, getAllSpaces);
// -spaceRouter.post("/element", userMiddleware, addElement);
// -spaceRouter.get("/:spaceId", userMiddleware, getSpaceElements);
// +
// +const spaceRouter = express.Router();
// +
// +spaceRouter.post("/", userMiddleware, createSpace)
// +spaceRouter.delete("/element", userMiddleware, deleteElement)
// +spaceRouter.delete("/:spaceId", userMiddleware, deleteSpace)
// +spaceRouter.get("/all", userMiddleware, getAllSpaces)
// +spaceRouter.post("/:spaceId", userMiddleware, getSpaceElementsbyId)
// +spaceRouter.post("/element", userMiddleware, addElementtoSpace)
// +
// +export default spaceRouter
// \ No newline at end of file
// diff --git a/apps/backend/src/routes/user.ts b/apps/backend/src/routes/user.ts
// new file mode 100644
// index 0000000..c81a744
// --- /dev/null
// +++ b/apps/backend/src/routes/user.ts
// @@ -0,0 +1,9 @@
// +import express from 'express'
// +import { userMiddleware } from '../middleware/user'
// +import { getbulkMetaData, UpdateMetadata } from '../actions/user'
// +const userRouter = express.Router()
// +
// +userRouter.post("/metadata",userMiddleware,UpdateMetadata)
// +userRouter.get("/metadata/bulk",getbulkMetaData)
// +
// +export default userRouter;
// \ No newline at end of file
// diff --git a/package-lock.json b/package-lock.json
// index 963ed16..9b7237a 100644
// --- a/package-lock.json
// +++ b/package-lock.json
// @@ -1385,6 +1385,7 @@
//        "resolved": "https://registry.npmjs.org/@types/express/-/express-5.0.0.tgz",
//        "integrity": "sha512-DvZriSMehGHL1ZNLzi6MidnsDhUZM/x2pRdDIKdwbUNqqwHxMlRdkxtn6/EPKyqKpHqTl/4nRZsRNLpZxZRpPQ==",
//        "dev": true,
// +      "license": "MIT",
//        "dependencies": {
//          "@types/body-parser": "*",
//          "@types/express-serve-static-core": "^5.0.0",`


// aiSummarieCommit(commitDiff)
//   .then(summary => {
//     console.log('Commit Summary:', summary);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });