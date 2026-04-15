'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, toast } from '@/components/ui/components';
import { Plus, Trash2, Save, Mail } from 'lucide-react';

export default function AdminSettings() {
  const [approverEmails, setApproverEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setApproverEmails(data.approverEmails || []);
      } else {
        toast.error(data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Invalid email format');
      return;
    }
    if (approverEmails.includes(newEmail)) {
      toast.error('Email already added');
      return;
    }
    setApproverEmails([...approverEmails, newEmail]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setApproverEmails(approverEmails.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (approverEmails.length === 0) {
      toast.error('At least one approver email is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverEmails }),
      });
      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted">Manage system-wide configurations and approval authority.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-2 mb-4">
            <Mail size={20} className="text-primary" />
            <h2>Approver Emails</h2>
          </div>
          
          <p className="text-sm text-muted mb-4">
            These emails will receive account activation requests for all new user signups. 
            You can add multiple email IDs to distribute approval authority.
          </p>

          <div className="flex gap-2 mb-6">
            <Input
              type="email"
              placeholder="Enter approver email (e.g., admin@onepws.com)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button onClick={handleAddEmail} variant="secondary" className="flex items-center gap-2">
              <Plus size={18} />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {approverEmails.length === 0 ? (
              <p className="text-center py-4 text-muted border border-dashed border-border rounded-lg italic">
                No approvers assigned. Please add at least one email.
              </p>
            ) : (
              approverEmails.map((email) => (
                <div key={email} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-border group">
                  <span className="font-medium">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    title="Remove Approver"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
