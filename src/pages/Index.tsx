
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
        <SidebarInset>
          <MainHeader onDataUpload={setUploadedData} />
          <WorkArea 
            selectedAnalysis={selectedAnalysis}
            data={uploadedData}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
