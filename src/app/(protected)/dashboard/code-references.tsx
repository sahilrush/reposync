"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Prism } from "react-syntax-highlighter";
import { zTouch } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  return (
    <div className="max-w-[70rem] "  >
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md max-w-[60rem] ">
          {filesReferences.map((file) => (
            <button
            onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                `px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted`,
                {
                  "bg-primary text-primary-foreground": tab === file.fileName,
                }
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md"
          >
            <Prism class="language-ts" language="ts" style={zTouch} className="rounded-md max-w-[65vw]">
                {file.sourceCode}
            </Prism>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
