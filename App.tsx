import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { processImageWithGemini } from './services/geminiService';
import { MilitaryRecord, ProcessingStatus } from './types';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [records, setRecords] = useState<MilitaryRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setStatus(ProcessingStatus.PROCESSING);
    setErrorMsg(null);
    setRecords([]);

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setCurrentImage(base64String);
      // Remove data url prefix for API
      const base64Data = base64String.split(',')[1];

      try {
        const extractedData = await processImageWithGemini(base64Data);
        setRecords(extractedData);
        setStatus(ProcessingStatus.SUCCESS);
      } catch (err: any) {
        setStatus(ProcessingStatus.ERROR);
        setErrorMsg(err.message || "حدث خطأ غير متوقع");
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadExcel = () => {
    if (records.length === 0) return;

    // Use Array of Arrays (AoA) to strictly enforce column order from Right (index 0) to Left (index 6)
    const headers = [
      "رقم العسكري",
      "الرتبة",
      "الاسم",
      "تاريخ الاستشهاد",
      "المكان",
      "الرقم الوطني",
      "ملاحظات" // Last column (Leftmost in RTL)
    ];

    const dataRows = records.map(record => [
      record.militaryNumber,
      record.rank,
      record.name,
      record.date,
      record.location,
      record.nationalId,
      "" // Empty notes
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    
    // Set column widths
    const wscols = [
      { wch: 15 }, // Mil No
      { wch: 10 }, // Rank
      { wch: 30 }, // Name
      { wch: 15 }, // Date
      { wch: 15 }, // Location
      { wch: 20 }, // National ID
      { wch: 20 }, // Notes
    ];
    worksheet['!cols'] = wscols;

    // Ensure the sheet is RTL so Column A starts on the Right
    if (!worksheet['!views']) {
      worksheet['!views'] = [];
    }
    worksheet['!views'][0] = { rightToLeft: true };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Military Data");
    
    XLSX.writeFile(workbook, "Military_Data_Extracted.xlsx");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <FileSpreadsheet className="w-10 h-10 text-blue-600" />
          مستخرج البيانات العسكرية
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          قم برفع صورة الجدول، وسيقوم الذكاء الاصطناعي باستخراج البيانات وتنظيفها وتجهيزها في ملف Excel.
        </p>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        
        {/* Upload Section */}
        <section>
          <FileUpload 
            onFileSelect={handleFileSelect} 
            disabled={status === ProcessingStatus.PROCESSING} 
          />
        </section>

        {/* Status Indicators */}
        {status === ProcessingStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white rounded-xl shadow-sm border border-blue-100">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">جاري معالجة الصورة...</h3>
              <p className="text-gray-500">نقوم بتحليل النصوص العربية وهيكلة الجدول (قد يستغرق بضع ثوانٍ)</p>
            </div>
          </div>
        )}

        {status === ProcessingStatus.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800">خطأ في المعالجة</h3>
              <p className="text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === ProcessingStatus.SUCCESS && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-800">تمت المعالجة بنجاح!</span>
                </div>
                <button
                  onClick={downloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  تحميل ملف Excel
                </button>
             </div>

            {/* Preview Image and Table */}
            <div className="grid grid-cols-1 gap-8">
               {currentImage && (
                 <div className="border rounded-lg p-4 bg-white shadow-sm">
                   <h3 className="text-sm font-semibold text-gray-500 mb-3">الصورة الأصلية:</h3>
                   <img src={currentImage} alt="Uploaded" className="max-h-64 object-contain mx-auto rounded" />
                 </div>
               )}
               
               <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">البيانات المستخرجة:</h3>
                  <DataTable data={records} />
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-gray-400 text-sm">
        مدعوم بواسطة Google Gemini AI Vision
      </footer>
    </div>
  );
};

export default App;