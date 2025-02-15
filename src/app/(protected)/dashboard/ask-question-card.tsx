"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import UseProject from "@/hooks/use-project";
import Image from "next/image";
import React from "react";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import { askQuestion } from "./actions";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = UseProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);

    void (async () => {
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((prev) => prev + delta);
        }
      }
    })();

    setLoading(false);
  };
  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[70vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src="/logo67.png" alt="logo" width={40} height={40} />
              </DialogTitle>
              <Button
                variant={"outline"}
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved!");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save answer!");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[30vh] max-w-[70vw] overflow-scroll"
          />
          <div className="h-4"></div>

          <CodeReferences filesReferences={filesReferences} />

          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should i edit to change the homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Reposync
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
