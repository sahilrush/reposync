"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import UseProject from '@/hooks/use-project'
import Image from 'next/image'
import React from 'react'
import { readStreamableValue } from 'ai/rsc'
import { askQuestion } from './actions'

const AskQuestionCard = () => {
    const { project } = UseProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading,setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{fileName:string, sourceCode:string, summary:string}[]>([])
    const [answer, setAnswer] = React.useState('')  

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(!project?.id) return
        setLoading(true)
        setOpen(true)


        const {output, filesReferences} = await askQuestion(question, project.id)
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {  
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }
            setLoading(false)


    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <Image src='/logo67.png' alt='logo' width={40} height={40} />
                    </DialogTitle>
                </DialogHeader>
                {answer}
                <h1>Files files References</h1>
                {filesReferences.map(file => {
                   return <span>{file.fileName}</span>
                })}

                </DialogContent> 
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should i edit to change the homepage?' value={question} onChange={e => setQuestion(e.target.value)} />
                        <div className='h-4'></div>
                        <Button type='submit'>
                            Ask Reposync
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>

    )
}

export default AskQuestionCard
