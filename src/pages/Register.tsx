import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { registerPatient } from '../services/store';
import { TRIAGE_LABELS, TRIAGE_COLORS } from '../types';
import type { RegisterFormData, TriageLevel } from '../types';
import { Card, CardBody } from '../components/ui/Card';

const TRIAGE_DESCRIPTIONS: Record<number, string> = {
  1: 'Life-threatening — Immediate resuscitation required',
  2: 'Potentially life-threatening — Emergency assessment',
  3: 'Urgent — Significant morbidity if not treated soon',
  4: 'Semi-urgent — Can safely wait 1–2 hours',
  5: 'Non-urgent — Routine, can wait 2+ hours',
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormData>({
    clinicRef: '',
    fullName: '',
    age: 0,
    symptoms: '',
    triageLevel: 3,
  });

  const [result, setResult] = useState<{
    patient: any;
    queueEntry: any;
    scoreResult: any;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'triageLevel' ? Number(value) : value,
    }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.clinicRef.trim()) return setError('Clinic Ref / NIC is required.');
    if (!form.fullName.trim()) return setError('Full Name is required.');
    if (!form.age || form.age < 0 || form.age > 150)
      return setError('Please enter a valid age.');
    if (!form.symptoms.trim()) return setError('Please describe the symptoms / chief complaint.');

    setLoading(true);
    setError(null);

    try {
      const res = registerPatient(form);
      setResult(res);
    } catch (err: any) {
      setError(err.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterAnother() {
    setResult(null);
    setForm({ clinicRef: '', fullName: '', age: 0, symptoms: '', triageLevel: 3 });
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Registered!</h1>
          <p className="text-gray-500 mt-1">Added to the triage queue successfully.</p>
        </div>

        {/* Patient Card */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Clinic Ref" value={result.patient.clinicRef} />
              <InfoRow label="Queue Entry #" value={`#${result.queueEntry.id}`} />
              <InfoRow label="Full Name" value={result.patient.fullName} span />
              <InfoRow label="Age" value={`${result.patient.age} years`} />
              <InfoRow label="Arrival Time" value={new Date(result.queueEntry.arrivalTime).toLocaleTimeString()} />
            </div>
          </CardBody>
        </Card>

        {/* Triage Card */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${TRIAGE_COLORS[form.triageLevel]}`}>
                T{form.triageLevel} — {TRIAGE_LABELS[form.triageLevel]}
              </span>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 font-mono">
              {result.scoreResult.explain}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-3xl font-black text-red-600">{result.scoreResult.score}</div>
              <div className="text-sm text-gray-500">Initial Priority Score</div>
            </div>
          </CardBody>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardBody>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              Score Breakdown
            </h3>
            <div className="space-y-2">
              <ScoreRow label="Severity Score" formula={`(6 - ${form.triageLevel}) × 100`} value={result.scoreResult.severityScore} color="text-red-600" />
              <ScoreRow label="Aging Boost" formula={`${result.scoreResult.waitMinutes} min × 2`} value={result.scoreResult.agingBoost} color="text-blue-600" />
              <ScoreRow label="Defer Penalty" formula="Not deferred" value={`-${result.scoreResult.deferPenalty}`} color="text-purple-600" />
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                <span>Total Priority Score</span>
                <span className="text-red-600 text-lg">{result.scoreResult.score}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <button
            onClick={handleRegisterAnother}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Register Another
          </button>
          <button
            onClick={() => navigate('/queue')}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            View Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus size={24} className="text-red-500" />
          Patient Registration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a walk-in patient and assign triage level.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Ref / NIC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clinicRef"
                  value={form.clinicRef}
                  onChange={handleChange}
                  placeholder="e.g. IC-1234 or 920101-14-5678"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age || ''}
                  onChange={handleChange}
                  placeholder="e.g. 35"
                  min={0}
                  max={150}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ahmad Bin Razali"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms / Chief Complaint <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="symptoms"
                  value={form.symptoms}
                  onChange={handleChange}
                  placeholder="Describe the patient's primary symptoms and chief complaint..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Triage Selection */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-gray-800 mb-4">Triage Level Assignment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as TriageLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, triageLevel: level }))}
                  className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                    form.triageLevel === level
                      ? `${TRIAGE_COLORS[level]} border-transparent shadow-lg scale-105`
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-xl font-black">{level}</div>
                  <div className="text-xs font-semibold mt-0.5">{TRIAGE_LABELS[level]}</div>
                  {form.triageLevel === level && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Triage description */}
            <div className="mt-4 flex items-start gap-2 bg-blue-50 rounded-xl p-3">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold text-blue-800">
                  Triage {form.triageLevel} — {TRIAGE_LABELS[form.triageLevel]}
                </div>
                <div className="text-blue-700 mt-0.5">{TRIAGE_DESCRIPTIONS[form.triageLevel]}</div>
              </div>
            </div>

            {/* Score preview */}
            <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="text-xs text-gray-500 font-medium mb-1">Estimated Initial Priority Score</div>
              <div className="font-mono text-sm text-gray-700">
                Severity = (6 − {form.triageLevel}) × 100 ={' '}
                <span className="font-bold text-red-600">{(6 - form.triageLevel) * 100}</span>
                {' '}+ Aging (grows over time)
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Register & Add to Queue
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function InfoRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}

function ScoreRow({ label, formula, value, color }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gray-700">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-mono">{formula}</span>
        <span className={`font-bold w-12 text-right ${color}`}>{value}</span>
      </div>
    </div>
  );
}
