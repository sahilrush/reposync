"use client";

import UseProject from '@/hooks/use-project';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import CommitLog from './commit-log';

const page = () => {
  const { project } = UseProject()
  return (
    <div >
      {project?.id}
      <div className='flex items-center justify-between flex-wrap gap-y-4 '>
        {/*GIthub link  */}
        <div className='w-fit  rounded-md bg-primary px-4 py-3'>
          <div className='flex items-center'>
            <Github className='size-5 text-white' />
            <div className='m-2 flex  '>
              <p className='text-sm font-medium text-white'>
                This project is link to {' '}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-white/80 hover:underline'>
                  {project?.githubUrl}
                  <ExternalLink className='ml-1 size-4' />
                </Link>
              </p>
            </div>

          </div>
        </div>

        <div className='h4'></div>

        <div className='flex items-center gap-4'>
          {/*Team members */}
          TeamMember
          ArchiveButton
          InviteButton

        </div>
      </div>
      <div className='mt-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
          AskQuestionCard
          Meetingcard
        </div>
      </div>
   <div className='mt-8'></div>
    <CommitLog />
      </div>
  )
}

export default page 
 