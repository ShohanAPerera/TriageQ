import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Download, Pill } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getPrescriptionById } from '../services/recordStore';
import { getPatientById } from '../services/store';
import type { Prescription, Patient } from '../types';

export default function PrescriptionView() {
  const { id } = useParams<{ id: string }>();
  const [rx, setRx] = useState<Prescription | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!id) return;
    const p = getPrescriptionById(id);
    if (p) {
      setRx(p);
      const pat = getPatientById(p.patientId);
      if (pat) setPatient(pat);
    }
  }, [id]);

  if (!rx || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <Pill size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold">Prescription Not Found</h2>
          <p className="mt-2">The requested prescription ID could not be located in the system.</p>
        </div>
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPDF() {
    const element = document.getElementById('printable-rx');
    if (element) {
      const opt = {
        margin: 0.5,
        filename: `Prescription_${patient!.clinicRef}_${rx!.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
      
      {/* Floating Action Menu (Hidden during print via css) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-full px-6 py-3 z-50 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-white hover:text-blue-400 font-medium transition-colors"
        >
          <Printer size={18} /> Print
        </button>
        <div className="w-px h-6 bg-gray-700 mx-2" />
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 text-white hover:text-green-400 font-medium transition-colors"
        >
          <Download size={18} /> Save PDF
        </button>
      </div>

      {/* Rx Container */}
      <div className="flex-1 flex justify-center p-8 print:p-0">
        
        {/* Printable Area */}
        <div 
          id="printable-rx" 
          className="bg-white shadow-xl max-w-[800px] w-[800px] print:shadow-none print:w-full p-12 mx-auto text-black border-t-8 border-blue-900"
        >
          <h1 className="text-3xl font-black mb-2 text-blue-900 border-b-2 border-blue-900 pb-2 flex items-center gap-2">
            <Pill className="text-blue-900" size={32} /> TriageQ Clinic - Prescription
          </h1>
          
          <div className="flex justify-between mb-8 mt-6 text-sm">
            <div className="space-y-1 text-gray-800">
              <strong className="text-xs text-blue-600 block mb-1 uppercase tracking-widest">Patient Details</strong>
              <div><strong>Name:</strong> {patient.fullName}</div>
              <div><strong>IC:</strong> {patient.clinicRef}</div>
              <div><strong>Age:</strong> {patient.age}</div>
            </div>
            <div className="text-right space-y-1 text-gray-800">
              <strong className="text-xs text-blue-600 block mb-1 uppercase tracking-widest">Prescription Info</strong>
              <div><strong>Date:</strong> {new Date(rx.createdAt).toLocaleDateString()}</div>
              <div><strong>Doctor:</strong> {rx.authorName}</div>
              <div><strong>Ref:</strong> {rx.id}</div>
            </div>
          </div>
          
          <div className="text-8xl font-serif text-gray-200 font-bold mb-6 italic select-none">Rx</div>
          
          <table className="w-full text-left border-collapse mb-12">
            <thead>
              <tr className="border-b-2 border-black text-gray-900 text-sm">
                <th className="py-2 w-1/2 uppercase tracking-wide">Medication</th>
                <th className="py-2 uppercase tracking-wide">Dosage</th>
                <th className="py-2 uppercase tracking-wide">Frequency</th>
                <th className="py-2 uppercase tracking-wide">Duration</th>
              </tr>
            </thead>
            <tbody>
              {rx.items.map((i, idx) => (
                <tr key={i.id} className={idx !== rx.items.length - 1 ? "border-b border-gray-200" : ""}>
                  <td className="py-4 font-bold text-lg text-gray-900">{i.medication}</td>
                  <td className="py-4 font-medium text-gray-700">{i.dosage}</td>
                  <td className="py-4 text-gray-600">{i.frequency}</td>
                  <td className="py-4 text-gray-600">{i.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rx.instructions && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-gray-800 mb-12">
              <strong className="block text-blue-900 mb-1">Doctor's Instructions:</strong> 
              {rx.instructions}
            </div>
          )}

          <div className="mt-24 pt-4 border-t border-gray-400 text-center text-sm text-gray-500">
            Official Prescription Document • TriageQ Queue Management System
          </div>
        </div>
      </div>
      
    </div>
  );
}
