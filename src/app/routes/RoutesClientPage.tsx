"use client";
import { useState } from "react";
import { useLanguage } from '../LanguageProvider';

interface Route {
  id: string;
  name: string;
  description?: string;
}

export default function RoutesClientPage({ initialRoutes }: { initialRoutes: Route[] }) {
  const { language } = useLanguage();
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchRoutes = async () => {
    setLoading(true);
    const res = await fetch("/api/routes");
    const data = await res.json();
    setRoutes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setName("");
    setDescription("");
    fetchRoutes();
  };

  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName) return;
    await fetch("/api/routes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editName, description: editDescription }),
    });
    setEditingId(null);
    fetchRoutes();
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      const response = await fetch(`/api/routes?id=${routeId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchRoutes();
      } else {
        const err = await response.json();
        alert(`Failed to delete route: ${err.error}`);
      }
    }
  };

  const startEdit = (route: Route) => {
    setEditingId(route.id);
    setEditName(route.name);
    setEditDescription(route.description || "");
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 16 }}>
      <h1>{language === 'gu' ? 'રૂટ્સ' : 'Routes'}</h1>
      <form onSubmit={handleAddRoute} style={{ marginBottom: 24 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === 'gu' ? 'રૂટનું નામ' : 'Route name'}
          required
          style={{ marginRight: 8 }}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={language === 'gu' ? 'વર્ણન' : 'Description'}
          style={{ marginRight: 8 }}
        />
        <button type="submit">{language === 'gu' ? 'રૂટ ઉમેરો' : 'Add Route'}</button>
      </form>
      {loading ? (
        <p>{language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}</p>
      ) : (
        <ul>
          {routes.map((route) => (
            <li key={route.id} style={{ marginBottom: 12 }}>
              {editingId === route.id ? (
                <form onSubmit={handleEditRoute}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder={language === 'gu' ? 'રૂટનું નામ' : 'Route name'}
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={language === 'gu' ? 'વર્ણન' : 'Description'}
                  />
                  <button type="submit">{language === 'gu' ? 'સાચવો' : 'Save'}</button>
                  <button type="button" onClick={() => setEditingId(null)}>{language === 'gu' ? 'રદ કરો' : 'Cancel'}</button>
                </form>
              ) : (
                <>
                  <strong>{route.name}</strong>
                  {route.description && <> - {route.description}</>}
                  <button style={{ marginLeft: 8 }} onClick={() => startEdit(route)}>{language === 'gu' ? 'ફેરફાર કરો' : 'Edit'}</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDeleteRoute(route.id)}>{language === 'gu' ? 'કાઢી નાખો' : 'Delete'}</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 