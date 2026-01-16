import React from 'react';
import { MilitaryRecord } from '../types';

interface DataTableProps {
  data: MilitaryRecord[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white mt-8" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th scope="col" className="px-6 py-3 text-right">رقم العسكري</th>
              <th scope="col" className="px-6 py-3 text-right">الرتبة</th>
              <th scope="col" className="px-6 py-3 text-right">الاسم</th>
              <th scope="col" className="px-6 py-3 text-right">تاريخ الاستشهاد</th>
              <th scope="col" className="px-6 py-3 text-right">المكان</th>
              <th scope="col" className="px-6 py-3 text-right">الرقم الوطني</th>
              <th scope="col" className="px-6 py-3 text-right border-r">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {row.militaryNumber || '-'}
                </td>
                <td className="px-6 py-4">{row.rank || '-'}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                <td dir="ltr" className="text-right px-6 py-4">{row.date || '-'}</td>
                <td className="px-6 py-4">{row.location || '-'}</td>
                <td className="px-6 py-4 font-mono">{row.nationalId || '-'}</td>
                <td className="px-6 py-4 bg-gray-50 border-r min-w-[150px]"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 border-t text-left text-xs text-gray-500">
        تم استخراج {data.length} سجل
      </div>
    </div>
  );
};