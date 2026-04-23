import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Download, Receipt } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getInvoiceById } from '../services/recordStore';
import { getPatientById } from '../services/store';
import type { Invoice, Patient } from '../types';

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!id) return;
    const inv = getInvoiceById(id);
    if (inv) {
      setInvoice(inv);
      const p = getPatientById(inv.patientId);
      if (p) setPatient(p);
    }
  }, [id]);

  if (!invoice || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <Receipt size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold">Invoice Not Found</h2>
          <p className="mt-2">The requested invoice ID could not be located in the system.</p>
        </div>
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPDF() {
    const element = document.getElementById('printable-invoice');
    if (element) {
      const opt = {
        margin: 0.5,
        filename: `Invoice_${patient!.clinicRef}_${invoice!.id}.pdf`,
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

      {/* Invoice Container */}
      <div className="flex-1 flex justify-center p-8 print:p-0">
        
        {/* Printable Area */}
        <div 
          id="printable-invoice" 
          className="bg-white shadow-xl max-w-[800px] w-[800px] print:shadow-none print:w-full p-12 mx-auto text-black border border-gray-200"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-5xl font-black text-emerald-900 tracking-tight">INVOICE</h1>
              <div className="text-gray-500 font-mono mt-2 tracking-widest text-sm">REF: {invoice.id}</div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">TriageQ Clinic</h2>
              <div className="text-gray-600 mt-1 space-y-0.5 text-sm">
                <p>123 Health Ave, Medical City</p>
                <p>contact@triageq.local • (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mb-12 border-t-2 border-b-2 border-emerald-900/10 py-6">
            <div>
              <strong className="text-xs text-emerald-600 block mb-2 uppercase tracking-widest">Billed To</strong>
              <div className="text-xl font-bold text-gray-900">{patient.fullName}</div>
              <div className="text-gray-600 text-sm mt-1">Patient ID: {patient.clinicRef}</div>
            </div>
            <div className="text-right">
              <strong className="text-xs text-emerald-600 block mb-2 uppercase tracking-widest">Date Issued</strong>
              <div className="text-xl font-bold text-gray-900">{new Date(invoice.createdAt).toLocaleDateString()}</div>
              <div className="mt-2 text-sm flex items-center justify-end gap-2">
                <strong className="text-gray-600">Status:</strong> 
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <table className="w-full text-left table-auto mb-12">
            <thead>
              <tr className="border-b-2 border-gray-800 text-sm">
                <th className="py-3 px-2 font-bold text-gray-800 uppercase tracking-wider">Description</th>
                <th className="py-3 px-2 font-bold text-gray-800 uppercase tracking-wider text-center w-24">Qty</th>
                <th className="py-3 px-2 font-bold text-gray-800 uppercase tracking-wider text-right w-32">Unit Price</th>
                <th className="py-3 px-2 font-bold text-gray-800 uppercase tracking-wider text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((i, index) => (
                <tr key={i.id} className={index !== invoice.items.length - 1 ? "border-b border-gray-200" : ""}>
                  <td className="py-4 px-2 text-gray-800">{i.description}</td>
                  <td className="py-4 px-2 text-center text-gray-600">{i.quantity}</td>
                  <td className="py-4 px-2 text-right text-gray-600">LKR {i.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right font-medium text-gray-900">LKR {i.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="w-1/2 ml-auto mb-16">
            <div className="space-y-3 text-sm border-t-2 border-gray-800 pt-4 px-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span>LKR {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax (5%)</span>
                <span>LKR {invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-emerald-900">LKR {invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-900 font-bold mb-1">Thank you for trusting TriageQ Clinic.</p>
            <p className="text-gray-500 text-sm">Please keep this invoice for your financial records. If you have any questions concerning this invoice, please contact our billing department.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
