import React, { useState, useEffect, useRef } from 'react';
import { FileText, Pill, Receipt, Search, Download, CheckCircle, Plus, DollarSign } from 'lucide-react';
import { getAllPatients } from '../services/store';
import { useAuth } from '../services/authStore';
import { 
  getPatientNotes, addMedicalNote, 
  getPatientPrescriptions, addPrescription, 
  getPatientInvoices, addInvoice, markInvoicePaid 
} from '../services/recordStore';
import type { Patient, MedicalNote, Prescription, Invoice, PrescriptionItem, InvoiceItem } from '../types';
import { Card, CardBody } from '../components/ui/Card';
import html2pdf from 'html2pdf.js';

export default function CareHub() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [activeTab, setActiveTab] = useState<'NOTES' | 'PRESCRIPTIONS' | 'FINANCE'>('NOTES');

  useEffect(() => {
    setPatients(getAllPatients().reverse());
  }, []);

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clinicRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Care Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage medical records, prescriptions, and billing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Patient Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl max-h-[600px] overflow-y-auto">
            {filteredPatients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="font-semibold text-gray-900">{p.fullName}</div>
                <div className="text-xs text-gray-500 mt-1">{p.clinicRef} • {p.age} yrs</div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">No patients found.</div>
            )}
          </div>
        </div>

        {/* Right Col: Active Workspace */}
        <div className="lg:col-span-3">
          {!selectedPatient ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center bg-gray-50/50">
              <div className="text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>Select a patient from the list to view and edit records.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Patient Header */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPatient.fullName}</h2>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>ID: {selectedPatient.clinicRef}</span>
                    <span>Age: {selectedPatient.age}</span>
                    <span>Registered: {new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                <TabButton active={activeTab === 'NOTES'} onClick={() => setActiveTab('NOTES')} icon={<FileText size={16} />} label="Medical Notes" />
                <TabButton active={activeTab === 'PRESCRIPTIONS'} onClick={() => setActiveTab('PRESCRIPTIONS')} icon={<Pill size={16} />} label="Prescriptions" />
                <TabButton active={activeTab === 'FINANCE'} onClick={() => setActiveTab('FINANCE')} icon={<Receipt size={16} />} label="Invoices / Bills" />
              </div>

              {/* Tab Content */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[500px]">
                {activeTab === 'NOTES' && <NotesSection patient={selectedPatient} user={user} />}
                {activeTab === 'PRESCRIPTIONS' && <PrescriptionSection patient={selectedPatient} user={user} />}
                {activeTab === 'FINANCE' && <FinanceSection patient={selectedPatient} user={user} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ============================================================================
// NOTES SECTION
// ============================================================================
function NotesSection({ patient, user }: any) {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    setNotes(getPatientNotes(patient.id));
  }, [patient.id]);

  function handleSave() {
    if (!content.trim()) return;
    const note = addMedicalNote({
      patientId: patient.id,
      authorName: user?.fullName || 'System User',
      content: content.trim()
    });
    setNotes([note, ...notes]);
    setContent('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-gray-800 mb-2">Add New Note</h3>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type clinical observations, complaints, or diagnoses here..."
          className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
        />
        <button onClick={handleSave} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          Save Note
        </button>
      </div>
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Past Notes</h3>
        {notes.length === 0 ? <p className="text-gray-500 text-sm">No notes found.</p> : (
          <div className="space-y-4">
            {notes.map(n => (
              <div key={n.id} className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-orange-900 text-sm">{n.authorName}</span>
                  <span className="text-xs text-orange-700">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-orange-900 text-sm whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PRESCRIPTION SECTION
// ============================================================================
function PrescriptionSection({ patient, user }: any) {
  const [history, setHistory] = useState<Prescription[]>([]);
  const [items, setItems] = useState<PrescriptionItem[]>([{ id: '1', medication: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getPatientPrescriptions(patient.id));
  }, [patient.id]);

  function handleAddItem() {
    setItems([...items, { id: Math.random().toString(), medication: '', dosage: '', frequency: '', duration: '' }]);
  }

  function handleItemChange(id: string, field: keyof PrescriptionItem, value: string) {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  function handleSave() {
    const validItems = items.filter(i => i.medication.trim() !== '');
    if (validItems.length === 0) return alert('Add at least one medication');

    const rx = addPrescription({
      patientId: patient.id,
      authorName: user?.fullName || 'System Doctor',
      items: validItems,
      instructions
    });
    setHistory([rx, ...history]);
    setItems([{ id: '1', medication: '', dosage: '', frequency: '', duration: '' }]);
    setInstructions('');
  }

  function viewPrescription(rx: Prescription) {
    window.open(`/prescription/${rx.id}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span>Create Prescription</span>
          <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <Plus size={16} /> Add Medication
          </button>
        </h3>
        
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-start">
              <span className="w-6 h-8 flex items-center justify-center font-bold text-gray-400">{idx + 1}.</span>
              <input type="text" placeholder="Medication (e.g. Amoxicillin)" value={item.medication} onChange={e => handleItemChange(item.id, 'medication', e.target.value)} className="flex-1 border p-2 text-sm rounded-lg" />
              <input type="text" placeholder="Dosage (e.g. 500mg)" value={item.dosage} onChange={e => handleItemChange(item.id, 'dosage', e.target.value)} className="w-24 border p-2 text-sm rounded-lg" />
              <input type="text" placeholder="Freq (e.g. 1x Day)" value={item.frequency} onChange={e => handleItemChange(item.id, 'frequency', e.target.value)} className="w-28 border p-2 text-sm rounded-lg" />
              <input type="text" placeholder="Days (e.g. 5 Days)" value={item.duration} onChange={e => handleItemChange(item.id, 'duration', e.target.value)} className="w-28 border p-2 text-sm rounded-lg" />
            </div>
          ))}
        </div>
        
        <textarea 
          placeholder="Additional Instructions / Notes..." 
          value={instructions} 
          onChange={e => setInstructions(e.target.value)} 
          className="w-full mt-4 border p-3 rounded-lg text-sm" 
          rows={2} 
        />
        
        <button onClick={handleSave} className="mt-4 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-bold w-full hover:bg-teal-700">
          Issue Prescription
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">Prescription History</h3>
        {history.length === 0 ? <p className="text-gray-500 text-sm">No prescriptions.</p> : (
          <div className="space-y-4">
            {history.map(rx => (
              <div key={rx.id} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Issued: {new Date(rx.createdAt).toLocaleDateString()} by {rx.authorName}</div>
                  <ul className="mt-2 text-sm text-gray-800 list-disc list-inside">
                    {rx.items.map(i => <li key={i.id}>{i.medication} {i.dosage} — {i.frequency} for {i.duration}</li>)}
                  </ul>
                  {rx.instructions && <div className="mt-2 text-xs text-gray-500 italic">Note: {rx.instructions}</div>}
                </div>
                <button onClick={() => viewPrescription(rx)} className="self-end sm:self-start bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 font-medium transition-colors">
                  <Pill size={16} /> View Rx
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FINANCE / INVOICE SECTION
// ============================================================================
function FinanceSection({ patient, user }: any) {
  const [history, setHistory] = useState<Invoice[]>([]);
  const [items, setItems] = useState([{ id: '1', description: 'General Consultation', qty: 1, unitPrice: 50 }]);
  
  useEffect(() => {
    setHistory(getPatientInvoices(patient.id));
  }, [patient.id]);

  function handleAddItem() {
    setItems([...items, { id: Math.random().toString(), description: '', qty: 1, unitPrice: 0 }]);
  }

  function handleItemChange(id: string, field: string, value: any) {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  function handleSave() {
    const validItems = items.filter(i => i.description.trim() !== '' && i.qty > 0 && i.unitPrice >= 0).map(i => ({
      id: i.id,
      description: i.description,
      quantity: Number(i.qty),
      unitPrice: Number(i.unitPrice),
      total: Number(i.qty) * Number(i.unitPrice)
    }));

    if (validItems.length === 0) return alert('Add at least one valid invoice item.');

    const subtotal = validItems.reduce((acc, curr) => acc + curr.total, 0);
    const tax = subtotal * 0.05; // 5% tax

    const inv = addInvoice({
      patientId: patient.id,
      authorName: user?.fullName || 'System Finance',
      items: validItems,
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      status: 'UNPAID'
    });

    setHistory([inv, ...history]);
    setItems([{ id: '1', description: '', qty: 1, unitPrice: 0 }]);
  }

  function handlePay(id: string) {
    const updated = markInvoicePaid(id);
    if (updated) {
      setHistory(history.map(h => h.id === id ? updated : h));
    }
  }

  function viewInvoice(inv: Invoice) {
    window.open(`/invoice/${inv.id}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span>Create Invoice</span>
          <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800">
            <Plus size={16} /> Add Item
          </button>
        </h3>
        
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center">
              <span className="w-6 h-8 flex items-center justify-center font-bold text-gray-400">{idx + 1}.</span>
              <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="flex-1 border p-2 text-sm rounded-lg" />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 hidden sm:block">Qty</span>
                <input type="number" min="1" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="w-16 border p-2 text-sm rounded-lg" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 hidden sm:block">LKR</span>
                <input type="number" min="0" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} className="w-24 border p-2 text-sm rounded-lg" />
              </div>
              <div className="w-28 text-right font-bold text-gray-700">LKR {(item.qty * item.unitPrice).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-emerald-200 pt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">Auto-adds 5% Tax</div>
          <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700">
            Generate Invoice
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">Billing History</h3>
        {history.length === 0 ? <p className="text-gray-500 text-sm">No invoices recorded.</p> : (
          <div className="space-y-4">
            {history.map(inv => (
              <div key={inv.id} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">LKR {inv.grandTotal.toFixed(2)}</h4>
                    <p className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()} • {inv.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {inv.status === 'UNPAID' ? (
                      <button onClick={() => handlePay(inv.id)} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded text-xs font-bold transition-colors">
                        Mark Paid
                      </button>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12}/> PAID
                      </span>
                    )}
                    <button onClick={() => viewInvoice(inv)} className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                      <Receipt size={14} /> View Invoice
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 mt-3">
                  {inv.items.map(i => (
                    <div key={i.id} className="flex justify-between text-sm text-gray-600">
                      <span>{i.quantity}x {i.description}</span>
                      <span>LKR {i.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
