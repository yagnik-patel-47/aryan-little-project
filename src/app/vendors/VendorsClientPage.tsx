"use client";
import { useState, useMemo } from "react";
import { useLanguage } from '../LanguageProvider';

interface Vendor {
  id: string;
  name: string;
  route_id: string;
  contact?: string;
  address?: string;
}
interface Route {
  id: string;
  name: string;
}

export default function VendorsClientPage({ initialVendors, initialRoutes }: { initialVendors: Vendor[], initialRoutes: Route[] }) {
  const { language } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [name, setName] = useState("");
  const [routeId, setRouteId] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const routeMap = useMemo(() => Object.fromEntries(routes.map(r => [r.id, r.name])), [routes]);

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !routeId) return;
    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, route_id: routeId, contact, address }),
    });
    setName("");
    setRouteId("");
    setContact("");
    setAddress("");
    fetchVendors();
  };

  const startEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setEditName(vendor.name);
    setEditContact(vendor.contact || "");
    setEditAddress(vendor.address || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditContact("");
    setEditAddress("");
  };

  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName) return;
    await fetch("/api/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editName, contact: editContact, address: editAddress }),
    });
    cancelEdit();
    fetchVendors();
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      const response = await fetch(`/api/vendors?id=${vendorId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchVendors();
      } else {
        const err = await response.json();
        alert(`Failed to delete vendor: ${err.error}`);
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 16 }}>
      <h1>{language === 'gu' ? 'વિક્રેતાઓ' : 'Vendors'}</h1>
      <form onSubmit={handleAddVendor} style={{ marginBottom: 24 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={language === 'gu' ? 'વિક્રેતાનું નામ' : 'Vendor name'}
          required
          style={{ marginRight: 8 }}
        />
        <select
          value={routeId}
          onChange={e => setRouteId(e.target.value)}
          required
          style={{ marginRight: 8 }}
          title={language === 'gu' ? 'રૂટ પસંદ કરો' : 'Select Route'}
        >
          <option value="">{language === 'gu' ? 'રૂટ પસંદ કરો' : 'Select Route'}</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
        <input
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder={language === 'gu' ? 'સંપર્ક' : 'Contact'}
          style={{ marginRight: 8 }}
        />
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder={language === 'gu' ? 'સરનામું' : 'Address'}
          style={{ marginRight: 8 }}
        />
        <button type="submit">{language === 'gu' ? 'વિક્રેતા ઉમેરો' : 'Add Vendor'}</button>
      </form>
      {loading ? (
        <p>{language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}</p>
      ) : (
        <ul>
          {vendors.map(vendor => (
            <li key={vendor.id} style={{ marginBottom: 12 }}>
              {editingId === vendor.id ? (
                <form onSubmit={handleEditVendor} style={{ display: 'inline' }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder={language === 'gu' ? 'વિક્રેતાનું નામ' : 'Vendor name'}
                    required
                    style={{ marginRight: 8 }}
                  />
                  <input
                    value={editContact}
                    onChange={e => setEditContact(e.target.value)}
                    placeholder={language === 'gu' ? 'સંપર્ક' : 'Contact'}
                    style={{ marginRight: 8 }}
                  />
                  <input
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    placeholder={language === 'gu' ? 'સરનામું' : 'Address'}
                    style={{ marginRight: 8 }}
                  />
                  <button type="submit">{language === 'gu' ? 'સાચવો' : 'Save'}</button>
                  <button type="button" onClick={cancelEdit} style={{ marginLeft: 8 }}>{language === 'gu' ? 'રદ કરો' : 'Cancel'}</button>
                </form>
              ) : (
                <>
                  <strong>{vendor.name}</strong> ({language === 'gu' ? 'રૂટ' : 'Route'}: {routeMap[vendor.route_id] || 'N/A'})
                  {vendor.contact && <> - {vendor.contact}</>}
                  {vendor.address && <> - {vendor.address}</>}
                  <button style={{ marginLeft: 8 }} onClick={() => startEdit(vendor)}>{language === 'gu' ? 'ફેરફાર કરો' : 'Edit'}</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDeleteVendor(vendor.id)}>{language === 'gu' ? 'કાઢી નાખો' : 'Delete'}</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 