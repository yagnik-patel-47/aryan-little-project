"use client";
import { useState } from "react";
import { useLanguage } from '../LanguageProvider';

interface Item {
  id: string;
  name_en: string;
  name_gu: string;
  rate: number;
  has_gst: boolean;
  gst_percentage?: number;
}

export default function ItemsClientPage({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [nameEn, setNameEn] = useState("");
  const [nameGu, setNameGu] = useState("");
  const [rate, setRate] = useState("");
  const [hasGst, setHasGst] = useState(false);
  const [gstPercentage, setGstPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items");
      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameGu || !rate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_en: nameEn,
          name_gu: nameGu,
          rate: parseFloat(rate),
          has_gst: hasGst,
          gst_percentage: gstPercentage ? parseFloat(gstPercentage) : null,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add item");
      }
      setNameEn("");
      setNameGu("");
      setRate("");
      setHasGst(false);
      setGstPercentage("");
      fetchItems(); // Refetch items to see the new one
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      fetchItems(); // Refetch to update the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 16 }}>
      <h1>{language === 'gu' ? 'વસ્તુઓ' : 'Items'}</h1>
      <form onSubmit={handleAddItem} style={{ marginBottom: 24 }}>
        <input
          value={nameEn}
          onChange={e => setNameEn(e.target.value)}
          placeholder={language === 'gu' ? 'નામ (અંગ્રેજી)' : 'Name (English)'}
          required
          style={{ marginRight: 8 }}
        />
        <input
          value={nameGu}
          onChange={e => setNameGu(e.target.value)}
          placeholder={language === 'gu' ? 'નામ (ગુજરાતી)' : 'Name (Gujarati)'}
          required
          style={{ marginRight: 8 }}
        />
        <input
          value={rate}
          onChange={e => setRate(e.target.value)}
          placeholder={language === 'gu' ? 'ભાવ' : 'Rate'}
          type="number"
          required
          style={{ marginRight: 8, width: 80 }}
        />
        <label style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={hasGst}
            onChange={e => setHasGst(e.target.checked)}
          />
          {language === 'gu' ? 'જી.એસ.ટી છે' : 'Has GST'}
        </label>
        <input
          value={gstPercentage}
          onChange={e => setGstPercentage(e.target.value)}
          placeholder={language === 'gu' ? 'જી.એસ.ટી %' : 'GST %'}
          type="number"
          style={{ marginRight: 8, width: 60 }}
          disabled={!hasGst}
        />
        <button type="submit" disabled={loading}>
          {loading ? (language === 'gu' ? 'ઉમેરી રહ્યું છે...' : 'Adding...') : (language === 'gu' ? 'ઉમેરો' : 'Add Item')}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && items.length === 0 ? (
        <p>{language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <strong>{language === 'gu' ? item.name_gu : item.name_en}</strong> {language === 'gu' ? '' : `(${item.name_gu})`} - ₹{item.rate} {item.has_gst && `(${language === 'gu' ? 'જી.એસ.ટી' : 'GST'}: ${item.gst_percentage ?? 0}%)`}
              <button onClick={() => handleDeleteItem(item.id)} style={{ marginLeft: '10px', color: 'red', border: '1px solid red', background: 'transparent', cursor: 'pointer' }}>
                {language === 'gu' ? 'કાઢી નાખો' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 