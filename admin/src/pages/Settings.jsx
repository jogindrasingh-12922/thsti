import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../api/axios';
import AdminPageLayout from '../components/AdminPageLayout';

export default function Settings() {
    const [settings, setSettings] = useState({
        siteName: '',
        logoUrl: '',
        contactEmail: '',
        contactPhone: '',
        workingHours: '',
        address: '',
        mapLink: '',
        facebookUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        copyrightText: '',
        preFooterViewAllText: '',
        preFooterViewAllUrl: '',
        preFooterViewAllActive: true,
        virtualTourText: 'VIRTUAL TOUR',
        virtualTourUrl: '#',
        virtualTourActive: true,
        isSearchEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/settings')
            .then(res => {
                // Ensure nulls become empty strings for controlled inputs
                const data = res.data;
                const safeData = {};
                for (const key in data) {
                    safeData[key] = data[key] === null ? '' : data[key];
                }
                setSettings(safeData);
            })
            .catch(err => console.error('Failed to load settings', err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', settings);
            alert('Settings updated successfully!');
        } catch (err) {
            console.error(err);
            const errDetails = err.response?.data?.details;
            if (errDetails && Array.isArray(errDetails) && errDetails.length > 0) {
                alert(`Validation failed:\n${errDetails.map(d => `- ${d.path.join('.')}: ${d.message}`).join('\n')}`);
            } else {
                alert(err.response?.data?.error || 'Failed to update settings');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;
    const actionButtons = (
        <button onClick={handleSubmit} disabled={saving} className="admin-btn-primary flex items-center gap-2 px-6 text-sm py-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
        </button>
    );

    return (
        <AdminPageLayout
            title="Global Settings"
            subtitle="Manage site-wide configuration and contact details"
            actionButtons={actionButtons}
        >
            <form onSubmit={handleSubmit} className="admin-card p-6 bg-white shadow-sm space-y-6 flex-1 overflow-auto min-h-0">
                {/* General Info */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Site Name *</label>
                            <input type="text" name="siteName" className="admin-input" value={settings.siteName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Logo URL</label>
                            <input type="text" name="logoUrl" className="admin-input" value={settings.logoUrl} onChange={handleChange} placeholder="/assets/images/logo.png" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Copyright Text</label>
                            <input type="text" name="copyrightText" className="admin-input" value={settings.copyrightText} onChange={handleChange} placeholder="© 2026 THSTI. All Rights Reserved." />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Contact Email</label>
                            <input type="email" name="contactEmail" className="admin-input" value={settings.contactEmail} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Contact Phone</label>
                            <input type="text" name="contactPhone" className="admin-input" value={settings.contactPhone} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Working Hours</label>
                            <input type="text" name="workingHours" className="admin-input" value={settings.workingHours} onChange={handleChange} placeholder="Mon to Sat: 9:am to 6pm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Address</label>
                            <textarea name="address" className="admin-input h-24" value={settings.address} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-text-main font-bold mb-1">Google Maps Embed Link</label>
                            <input type="text" name="mapLink" className="admin-input font-mono text-sm" value={settings.mapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Facebook URL</label>
                            <input type="url" name="facebookUrl" className="admin-input" value={settings.facebookUrl} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Twitter URL</label>
                            <input type="url" name="twitterUrl" className="admin-input" value={settings.twitterUrl} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">LinkedIn URL</label>
                            <input type="url" name="linkedinUrl" className="admin-input" value={settings.linkedinUrl} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Pre-Footer Strip Info */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">Pre-Footer "View All" Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Button Text</label>
                            <input type="text" name="preFooterViewAllText" className="admin-input" value={settings.preFooterViewAllText} onChange={handleChange} placeholder="VIEW ALL" />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Target URL</label>
                            <input type="text" name="preFooterViewAllUrl" className="admin-input" value={settings.preFooterViewAllUrl} onChange={handleChange} placeholder="/partners" />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" name="preFooterViewAllActive" id="preFooterViewAllActive" checked={settings.preFooterViewAllActive} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <label htmlFor="preFooterViewAllActive" className="text-text-main font-bold cursor-pointer">Show "View All" Button</label>
                        </div>
                    </div>
                </div>

                {/* Virtual Tour Button */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">Header "Virtual Tour" Button</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-text-main font-bold mb-1">Button Text</label>
                            <input type="text" name="virtualTourText" className="admin-input" value={settings.virtualTourText} onChange={handleChange} placeholder="VIRTUAL TOUR" />
                        </div>
                        <div>
                            <label className="block text-text-main font-bold mb-1">Target URL</label>
                            <input type="text" name="virtualTourUrl" className="admin-input" value={settings.virtualTourUrl} onChange={handleChange} placeholder="360 tour URL or #..." />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" name="virtualTourActive" id="virtualTourActive" checked={settings.virtualTourActive} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <label htmlFor="virtualTourActive" className="text-text-main font-bold cursor-pointer">Show "Virtual Tour" Button in Navigation</label>
                        </div>
                    </div>
                </div>

                {/* Site Search Settings */}
                <div>
                    <h3 className="text-lg font-bold text-primary border-b border-border-light pb-2 mb-4">Header Search Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" name="isSearchEnabled" id="isSearchEnabled" checked={settings.isSearchEnabled} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <label htmlFor="isSearchEnabled" className="text-text-main font-bold cursor-pointer">Enable Search Box in Header</label>
                        </div>
                    </div>
                </div>

            </form>
        </AdminPageLayout>
    );
}
