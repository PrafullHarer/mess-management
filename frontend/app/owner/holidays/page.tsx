'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { Plus, Trash2, Edit2, X, Calendar } from 'lucide-react';

interface Holiday {
    id: string;
    date: string;
    name: string;
    slot: string;
    reason: string;
}

const SLOT_OPTIONS = ['Whole Day', 'Afternoon', 'Evening'] as const;

const SLOT_STYLES: Record<string, { bg: string; text: string }> = {
    'Whole Day': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Afternoon': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Evening': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: '',
        slot: 'Whole Day' as typeof SLOT_OPTIONS[number],
        reason: ''
    });

    const fetchHolidays = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/holidays');
            setHolidays(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date) {
            alert('Date is required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                date: formData.date,
                slot: formData.slot,
                reason: formData.reason,
                name: formData.reason
            };

            if (editingId) {
                await API.put(`/holidays/${editingId}`, payload);
            } else {
                await API.post('/holidays', payload);
            }
            fetchHolidays();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err?.response?.data?.message || 'Failed to save holiday');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this holiday?')) return;
        try {
            await API.delete(`/holidays/${id}`);
            fetchHolidays();
        } catch {
            alert('Failed to delete holiday');
        }
    };

    const openEditModal = (holiday: Holiday) => {
        setEditingId(holiday.id);
        setFormData({
            date: holiday.date,
            slot: (holiday.slot || 'Whole Day') as typeof SLOT_OPTIONS[number],
            reason: holiday.reason || holiday.name || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ date: '', slot: 'Whole Day', reason: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">Holidays</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage global mess holidays ({holidays.length} total)</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Holiday
                </button>
            </div>

            {/* Holiday List */}
            <div className="space-y-3">
                {holidays.map(holiday => {
                    const slotStyle = SLOT_STYLES[holiday.slot] || SLOT_STYLES['Whole Day'];
                    return (
                        <div key={holiday.id} className="card flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0A0A0A]">
                                        {new Date(holiday.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${slotStyle.bg} ${slotStyle.text}`}>
                                            {holiday.slot || 'Whole Day'}
                                        </span>
                                        {(holiday.reason || holiday.name) && (
                                            <span className="text-xs text-neutral-500">{holiday.reason || holiday.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openEditModal(holiday)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(holiday.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {holidays.length === 0 && (
                <div className="text-center py-16 text-neutral-500">No holidays added yet.</div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Holiday' : 'Add Holiday'}</h2>
                            <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 mb-2 block">Slot</label>
                                <div className="flex gap-2">
                                    {SLOT_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`flex-1 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all ${formData.slot === s
                                                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                                }`}
                                            onClick={() => setFormData({ ...formData, slot: s })}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 mb-2 block">Reason / Note</label>
                                <input
                                    placeholder="Optional"
                                    className="input-field"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
