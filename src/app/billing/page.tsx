"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from '../LanguageProvider';

// Types
interface Item {
  id: string;
  name_en: string;
  name_gu: string;
  rate: number;
  gst_percentage?: number;
}
interface Vendor {
  id: string;
  name: string;
  route_id: string;
}
interface BillItem {
  item_id: string;
  quantity: number;
}
interface BillItemDetails extends BillItem {
  name: string;
  rate: number;
  gst_percentage?: number;
}
interface Route {
  id: string;
  name: string;
}

export default function BillingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  // Data from API
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  // Form state
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentBillItems, setCurrentBillItems] = useState<BillItemDetails[]>([]);

  // Temp state for adding a new item to the bill
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setInitialLoading(true);
      setError(null);
      try {
        const [vendorsRes, itemsRes, routesRes] = await Promise.all([
          fetch("/api/vendors"),
          fetch("/api/items"),
          fetch("/api/routes"),
        ]);

        if (!vendorsRes.ok || !itemsRes.ok || !routesRes.ok) {
          throw new Error("Failed to fetch initial data");
        }

        const vendorsData = await vendorsRes.json();
        const itemsData = await itemsRes.json();
        const routesData = await routesRes.json();

        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setRoutes(Array.isArray(routesData) ? routesData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddItemToBill = () => {
    if (!selectedItemId || quantity <= 0) {
      setError("Please select an item and enter a valid quantity.");
      return;
    }
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    setCurrentBillItems(prev => [
      ...prev,
      { item_id: item.id, name: item.name_en, rate: item.rate, quantity, gst_percentage: item.gst_percentage },
    ]);
    setSelectedItemId("");
    setQuantity(1);
    setError(null);
  };

  const handleRemoveItemFromBill = (index: number) => {
    setCurrentBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const filteredVendors = selectedRouteId ? vendors.filter(v => v.route_id === selectedRouteId) : [];

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (!vendorId || !date || currentBillItems.length === 0) {
      setError("Please select a vendor, date, and add at least one item.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const billItemsForApi = currentBillItems.map(({ item_id, quantity }) => ({
      item_id,
      quantity,
    }));

    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor_id: vendorId, date, items: billItemsForApi }),
    });

    if (res.ok) {
      setSuccess("Bill created successfully! Added to summary.");
      // Reset form
      setVendorId("");
      setDate(new Date().toISOString().split('T')[0]);
      setCurrentBillItems([]);
      setRedirecting(true);
      setTimeout(() => {
        router.push("/summary");
      }, 2000);
    } else {
      const errData = await res.json();
      setError(errData.error || "Failed to create bill.");
    }
    setLoading(false);
  };
  
  const totalAmount = currentBillItems.reduce((acc, item) => acc + (item.rate * item.quantity), 0);

  if (initialLoading) {
    return <p>{language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}</p>;
  }

  if (error && items.length === 0 && vendors.length === 0) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 16 }}>
      <h1>{language === 'gu' ? 'બિલ બનાવો' : 'Create Bill'}</h1>
      
      <form onSubmit={handleSubmitBill}>
        {/* Bill Header */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <select value={selectedRouteId} onChange={e => {setSelectedRouteId(e.target.value); setVendorId('');}} required title={language === 'gu' ? 'રૂટ પસંદ કરો' : 'Select Route'}>
            <option value="">{language === 'gu' ? 'રૂટ પસંદ કરો' : 'Select Route'}</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={vendorId} onChange={e => setVendorId(e.target.value)} required disabled={!selectedRouteId} title={language === 'gu' ? 'વિક્રેતા પસંદ કરો' : 'Select Vendor'}>
            <option value="">{language === 'gu' ? 'વિક્રેતા પસંદ કરો' : 'Select Vendor'}</option>
            {filteredVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required title={language === 'gu' ? 'તારીખ પસંદ કરો' : 'Select Date'} />
        </div>

        {/* Add Item Section */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h2>{language === 'gu' ? 'બિલમાં વસ્તુ ઉમેરો' : 'Add Item to Bill'}</h2>
          <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} title={language === 'gu' ? 'વસ્તુ પસંદ કરો' : 'Select Item'}>
            <option value="">{language === 'gu' ? 'વસ્તુ પસંદ કરો' : 'Select Item'}</option>
            {items.map(i => <option key={i.id} value={i.id}>{language === 'gu' ? i.name_gu : i.name_en}</option>)}
          </select>
          <label htmlFor="quantity-input" style={{ marginRight: 8 }}>{language === 'gu' ? 'જથ્થો:' : 'Quantity:'}</label>
          <input
            id="quantity-input"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            min="1"
            placeholder={language === 'gu' ? 'જથ્થો દાખલ કરો' : 'Enter quantity'}
            style={{ width: '80px', margin: '0 1rem' }}
          />
          <button type="button" onClick={handleAddItemToBill}>{language === 'gu' ? 'વસ્તુ ઉમેરો' : 'Add Item'}</button>
        </div>

        {/* Current Bill Items */}
        <h2>{language === 'gu' ? 'બિલની વસ્તુઓ' : 'Bill Items'}</h2>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              minWidth: 900,
              borderCollapse: 'collapse',
              tableLayout: 'auto',
            }}
          >
            <thead>
              <tr>
                <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'વસ્તુ' : 'Item'}</th>
                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'જથ્થો' : 'Quantity'}</th>
                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ભાવ' : 'Rate'}</th>
                <th style={{ minWidth: 70, padding: 8 }}>{language === 'gu' ? 'GST %' : 'GST %'}</th>
                <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'GST રકમ' : 'GST Amount'}</th>
                <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST વગર' : 'Without GST'}</th>
                <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST સાથે' : 'With GST'}</th>
                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ક્રિયાઓ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {currentBillItems.map((item, index) => {
                const withoutGst = item.rate * item.quantity;
                const gstRate = item.gst_percentage || 0;
                const gstAmount = withoutGst * (gstRate / 100);
                const withGst = withoutGst + gstAmount;
                return (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rate.toFixed(2)}</td>
                    <td>{gstRate}%</td>
                    <td>{gstAmount.toFixed(2)}</td>
                    <td>{withoutGst.toFixed(2)}</td>
                    <td>{withGst.toFixed(2)}</td>
                    <td><button type="button" onClick={() => handleRemoveItemFromBill(index)}>{language === 'gu' ? 'કાઢી નાખો' : 'Delete'}</button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}><b>{language === 'gu' ? 'કુલ' : 'Total'}</b></td>
                <td>{currentBillItems.reduce((sum, item) => sum + (item.rate * item.quantity) * ((item.gst_percentage || 0) / 100), 0).toFixed(2)}</td>
                <td>{currentBillItems.reduce((sum, item) => sum + (item.rate * item.quantity), 0).toFixed(2)}</td>
                <td>{currentBillItems.reduce((sum, item) => sum + (item.rate * item.quantity) * (1 + (item.gst_percentage || 0) / 100), 0).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <h3>{language === 'gu' ? 'કુલ:' : 'Total:'} {totalAmount.toFixed(2)}</h3>

        {/* Submit */}
        <button type="submit" disabled={loading || !vendorId || !date || currentBillItems.length === 0}>
          {loading ? (language === 'gu' ? 'સબમિટ થઈ રહ્યું છે...' : 'Submitting...') : (language === 'gu' ? 'બિલ સબમિટ કરો' : 'Submit Bill')}
        </button>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && (
          <div style={{ color: 'green', marginTop: 8 }}>
            <p>{success}</p>
            <button type="button" onClick={() => router.push("/summary")}>{language === 'gu' ? 'સારાંશ પર જાઓ' : 'Go to Summary'}</button>
            {redirecting && <p style={{ color: '#555', fontSize: 12 }}>{language === 'gu' ? 'સારાંશ પર રીડાયરેક્ટ થઈ રહ્યું છે...' : 'Redirecting to summary...'}</p>}
          </div>
        )}
      </form>
    </div>
  );
} 