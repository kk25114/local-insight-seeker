
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AnalysisSidebar } from '@/components/AnalysisSidebar';
import { MainHeader } from '@/components/MainHeader';
import { WorkArea } from '@/components/WorkArea';

const Index = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AnalysisSidebar 
          selectedAnalysis={selectedAnalysis}
          onSelectAnalysis={setSelectedAnalysis}
        />
        <div className="flex-1 flex flex-col">
          <MainHeader onDataUpload={setUploadedData} />
          <WorkArea 
            selectedAnalysis={selectedAnalysis}
            data={uploadedData}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
