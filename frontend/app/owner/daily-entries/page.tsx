'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { Plus, Trash2, Edit2, X, DollarSign } from 'lucide-react';

interface DailyEntry {
    id: string;
    date: string;
    slot: string;
    online: number;
    cash: number;
    total: number;
}

export default function DailyEntriesPage() {
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        slot: 'Daily',
        online: 0,
        cash: 0
    });

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/daily-entries');
            setEntries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date) {
            alert('Date is required');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await API.put(`/daily-entries/${editingId}`, formData);
            } else {
                await API.post('/daily-entries', formData);
            }
            fetchEntries();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err?.response?.data?.message || 'Failed to save entry');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        try {
            await API.delete(`/daily-entries/${id}`);
            fetchEntries();
        } catch {
            alert('Failed to delete entry');
        }
    };

    const openEditModal = (entry: DailyEntry) => {
        setEditingId(entry.id);
        setFormData({
            date: entry.date,
            slot: entry.slot || 'Daily',
            online: entry.online,
            cash: entry.cash
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            slot: 'Daily',
            online: 0,
            cash: 0
        });
    };

    // Group entries by date
    const grouped = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, DailyEntry[]>);

    const totalOnline = entries.reduce((a, e) => a + e.online, 0);
    const totalCash = entries.reduce((a, e) => a + e.cash, 0);

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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">Daily Entries</h1>
                    <p className="text-neutral-500 text-sm mt-1">Track daily cash and online income</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Entry
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Total Online</p>
                    <p className="text-2xl font-bold text-blue-600">₹{totalOnline.toLocaleString()}</p>
                </div>
                <div className="card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Total Cash</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{totalCash.toLocaleString()}</p>
                </div>
                <div className="card bg-[#0A0A0A] text-white border-[#0A0A0A]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Grand Total</p>
                    <p className="text-2xl font-bold text-[#C8FF00]">₹{(totalOnline + totalCash).toLocaleString()}</p>
                </div>
            </div>

            {/* Entries by Date */}
            <div className="space-y-4">
                {Object.entries(grouped).map(([date, dayEntries]) => {
                    const dayTotal = dayEntries.reduce((a, e) => a + e.total, 0);
                    return (
                        <div key={date} className="card">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-[#0A0A0A]">
                                    {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </h3>
                                <span className="font-bold text-sm">₹{dayTotal.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                                {dayEntries.map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {entry.slot && entry.slot !== 'Daily' && (
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${entry.slot === 'Afternoon' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {entry.slot}
                                                </span>
                                            )}
                                            <div className="text-sm">
                                                <span className="text-blue-600 font-medium">Online: ₹{entry.online}</span>
                                                <span className="mx-2 text-neutral-300">|</span>
                                                <span className="text-emerald-600 font-medium">Cash: ₹{entry.cash}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">₹{entry.total}</span>
                                            <button onClick={() => openEditModal(entry)} className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(entry.id)} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {entries.length === 0 && (
                <div className="text-center py-16 text-neutral-500">No daily entries yet.</div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Entry' : 'Add Entry'}</h2>
                            <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 mb-2 block">Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Online ₹</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.online}
                                        onChange={e => setFormData({ ...formData, online: parseInt(e.target.value) || 0 })}
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Cash ₹</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.cash}
                                        onChange={e => setFormData({ ...formData, cash: parseInt(e.target.value) || 0 })}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="card bg-neutral-50 text-center">
                                <p className="text-sm text-neutral-500">Total</p>
                                <p className="text-2xl font-bold text-[#0A0A0A]">₹{(formData.online + formData.cash).toLocaleString()}</p>
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
