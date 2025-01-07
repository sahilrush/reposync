"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UseProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QAPage = () => {
  const {projectId} = UseProject()
  const { data: question } = api.project.getQuestions.useQuery({ projectId });
  const [questionIndex,setQuestionIndex] = React.useState<number>(0);
  const questions = question?.[questionIndex];
  return (
  <Sheet>
    <AskQuestionCard />
    <div className="h-4"></div>
    <div className="font-semibold text-xl">Saved Questions</div>
    <div className="h-2"></div>
    <div className="flex flex-col gap-2 ">
        {question?.map((questions,index) => {
          return <React.Fragment key={questions.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-border hover:scale-95 transition-transform">
                <img  className="rounded-full"  height={30} width={30} src={questions.user.imageUrl?? ""} alt="" />
                <div className="text-left flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 line-clamp-1 text-lg font-medium font">
                      {questions.question}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap ">
                      {questions.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-400 line-clamp-1 text-sm">{questions.answer}</p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        })}
    </div>

        {questions && (
          <SheetContent className="sm:max-w-[80vw] overflow-scroll">
            <SheetHeader>
              <SheetTitle className="text-xl font-medium text-gray-700 ">
                {questions.question}
                
              </SheetTitle>
              <MDEditor.Markdown source={questions.answer} />
              <CodeReferences filesReferences={(questions.filesReferences ?? []) as any}/>
            </SheetHeader>
          </SheetContent>
        )}

  </Sheet>
  );

};


export default QAPage;

